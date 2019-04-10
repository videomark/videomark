// 計測データの取得を行う
import ChromeExtensionWrapper from "../ChromeExtensionWrapper";
import Api from "../Api";
import AppData from "../AppData";
import AppDataActions from "../AppDataActions";
import Country from "./Country";
import Subdivision from "./Subdivision";
import MeasureState from "./MeasureState";
import Viewing from "../Viewing";

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

  async updateSubdivision(subdivisions) {
    if (!("subdivisions" in this.average)) {
      this.average.subdivisions = {};
    }

    const requestSubdivisions = subdivisions.filter(item => {
      if (!(item.country in this.average.subdivisions)) {
        return true;
      }

      if (item.subdivision in this.average.subdivisions[item.country]) {
        return false;
      }
      return true;
    });

    if (requestSubdivisions.length === 0) {
      return;
    }

    const requests = [];
    requestSubdivisions.forEach(item => {
      const request = Api.subdivision(item.country, item.subdivision)
        .then(response => {
          if (!response.ok) {
            throw new Error(response);
          }
          return response.json();
        })
        .then(body => {
          if (body.length === 0) {
            return;
          }
          const { country, subdivision, data } = body[0];
          if (!(country in this.average.subdivisions)) {
            this.average.subdivisions[country] = {};
          }
          const average = Math.floor(data[0].average * 10) / 10;
          this.average.subdivisions[country][subdivision] = average;
        })
        .catch(error => {
          console.error(`VIDEOMARK: ${error}`);
        });
      requests.push(request);
    });

    await Promise.all(requests);
  }

  async updateHour() {
    // 時間帯平均は一回で24時間分全部取得するためここでブロック
    if ("hour" in this.average) {
      return;
    }

    this.average.hour = {};
    await Api.hour()
      .then(response => {
        if (!response.ok) {
          throw new Error(response);
        }
        return response.json();
      })
      .then(body => {
        if (body.length === 0) {
          return;
        }
        body.forEach(item => {
          this.average.hour[item.hour] = item.average;
        });
      })
      .catch(error => {
        console.error(`VIDEOMARK: ${error}`);
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
          const country = await viewing.country;
          const subdivision = await viewing.subdivision;
          const isp = await viewing.isp;
          return {
            id,
            title,
            location,
            thumbnail,
            startTime,
            qoe: saturateQoe(qoe > 0 ? qoe : 0),
            state: new MeasureState(qoe > 0 ? qoe : 0),
            country,
            subdivision,
            isp
          };
        }
      )
    );

    const subdivisions = viewingList
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
    await this.updateSubdivision(subdivisions);

    await this.updateHour();

    const result = viewingList.map(viewing => {
      const { country, subdivision } = viewing;
      const average = [];
      if (
        country in this.average.subdivisions &&
        subdivision in this.average.subdivisions[country]
      ) {
        const subdivisionAverage = this.average.subdivisions[country][
          subdivision
        ];
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
            value: saturateQoe(subdivisionAverage)
          });
        }
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
