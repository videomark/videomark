// 計測データの取得を行う
import ChromeExtensionWrapper from "../ChromeExtensionWrapper";
import AppData from "../AppData";
import AppDataActions from "../AppDataActions";
import Country from "./Country";
import Subdivision from "./Subdivision";
import Viewing from "../Viewing";
import HourlyAverageQoE from "../HourlyAverageQoE";
import RegionalAverageQoE from "../RegionalAverageQoE";

const saturateQoe = average => {
  const averageFloor = Math.floor(average * 10) / 10;
  return averageFloor > 5 ? "5.0" : averageFloor.toFixed(1).toString();
};

class MeasureData {
  constructor() {
    this.qoeData = {};
    this.average = {};
    this.updateListner = null;
    this.wait = false;
    this.beforeMostMonth = null;
  }

  // データをリクエストするIDリスト
  toRequestIds(storageData) {
    const monthFilter = AppData.get(AppDataActions.MonthFilter);
    const minDate = new Date(monthFilter.getFullYear(), monthFilter.getMonth());
    const maxDate = new Date(
      monthFilter.getFullYear(),
      monthFilter.getMonth() + 1
    );

    return storageData
      .filter(item => {
        return !(item.id in this.qoeData);
      })
      .filter(item => {
        const startTime = new Date(item.data.start_time);
        if (minDate <= startTime && startTime < maxDate) {
          return true;
        }
        return false;
      })
      .map(item => {
        return {
          session_id: item.data.session_id,
          video_id: item.data.video_id
        };
      });
  }

  async toQoeInclusiveData(storageData) {
    const viewingList = await Promise.all(
      this.toRequestIds(storageData).map(
        async ({ session_id: sessionId, video_id: videoId }) => {
          const viewing = new Viewing({ sessionId, videoId });
          const id = await viewing.init();
          const title = await viewing.title;
          const location = await viewing.location;
          const thumbnail = await viewing.thumbnail;
          const startTime = await viewing.startTime;
          const qoe = await viewing.qoe;
          const { country, subdivision, isp } = (await viewing.region) || {};
          return {
            id,
            title,
            location,
            thumbnail,
            startTime,
            qoe: saturateQoe(qoe > 0 ? qoe : 0),
            country,
            subdivision,
            isp
          };
        }
      )
    );

    const regions = viewingList
      .map(({ country, subdivision }) => ({
        country,
        subdivision
      }))
      .filter(
        (region, i, self) =>
          i ===
          self.findIndex(
            r =>
              r.country === region.country &&
              r.subdivision === region.subdivision
          )
      );

    if (this.average.region === undefined) {
      const regionalAverage = new RegionalAverageQoE(regions);
      this.average.region = await regionalAverage.init();
    }
    if (this.average.hour === undefined) {
      const hourlyAverage = new HourlyAverageQoE();
      this.average.hour = await hourlyAverage.init();
    }

    const result = viewingList.map(viewing => {
      const { country, subdivision } = viewing;
      const average = [];
      const region = Country.isJapan(country)
        ? Subdivision.codeToName(subdivision)
        : Country.codeToName(country);
      if (region === undefined) {
        average.push({
          label: "不明",
          modalLabel: `地域平均: 不明`,
          value: "0.0"
        });
      } else {
        average.push({
          label: region,
          modalLabel: `地域平均: ${region}`,
          value: saturateQoe(this.average.region[country][subdivision])
        });
      }

      const hour = viewing.startTime.getHours();
      // 時間のデータが存在する時
      if (hour in this.average.hour) {
        average.push({
          label: `${hour}時`,
          modalLabel: `時間平均: ${hour}時`,
          value: saturateQoe(this.average.hour[hour])
        });
      }

      return Object.assign(viewing, { average });
    });

    return result;
  }

  async toRenderData(storageData) {
    const qoeData = await this.toQoeInclusiveData(storageData);
    return qoeData.sort((a, b) => (a.startTime > b.startTime ? -1 : 1));
  }

  // 外部からの呼び出し
  initialize(dataUpdateListner) {
    this.updateListner = dataUpdateListner;
  }

  async update() {
    this.wait = true;
    ChromeExtensionWrapper.loadVideoIds(async value => {
      const renderData = await this.toRenderData(value);
      this.wait = false;
      this.updateListner(renderData);
    });
  }
}

const measureData = new MeasureData();
export default measureData;
