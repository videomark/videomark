// 計測データの取得を行う
import ChromeExtensionWrapper from "../ChromeExtensionWrapper";
import Api from "../Api";
import {
  viewingIdWithoutDateTimeFromSessionAndVideo,
  viewingIdWithoutDateTimeFromViewintId
} from "../Utils";
import AppData from "../AppData";
import AppDataActions from "../AppDataActions";
import Country from "./Country";
import Subdivision from "./Subdivision";
import MeasureState from "./MeasureState";

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

  average() {
    return this.average;
  }

  getQoe(id) {
    return this.contents[id];
  }

  getData(id) {
    const qoe = this.getQoe(id);
    return { qoe };
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

  toSubdivisions() {
    const subdivisions = [];
    Object.keys(this.qoeData).forEach(key => {
      const { country, subdivision } = this.qoeData[key];
      if (
        subdivisions.find(
          item => item.country === country && item.subdivision === subdivision
        ) === undefined
      ) {
        subdivisions.push({ country, subdivision });
      }
    });

    return subdivisions;
  }

  async updateFixedQoe(ids) {
    if (ids.length === 0) {
      return false;
    }

    let result = true;
    await Api.fixed(ids)
      .then(response => {
        if (!response.ok) {
          return new Error(response);
        }
        // エラーテスト
        return response.json();
      })
      .then(body => {
        body.forEach(data => {
          const viewingId = data.viewing_id;
          const id = viewingIdWithoutDateTimeFromViewintId(viewingId);
          this.qoeData[id] = { qoe: data.qoe };
        });
        result = false;
      })
      .catch(error => {
        console.error(`VIDEOMARK: ${error}`);
      });

    return result;
  }

  async updateStatsInfo(ids) {
    if (ids.length === 0) {
      return false;
    }

    const request = ids
      .filter(item => {
        const id = viewingIdWithoutDateTimeFromSessionAndVideo(
          item.session_id,
          item.video_id
        );

        return id in this.qoeData;
      })
      .map(item =>
        Api.statsInfo(item.video_id, item.session_id)
          .then(response => {
            if (!response.ok) {
              // TODO:後で
              throw new Error(response);
            }
            return response.json();
          })
          .then(body => {
            if (body.length === 0) {
              return;
            }

            const id = viewingIdWithoutDateTimeFromSessionAndVideo(
              body[0].session,
              body[0].video
            );
            const { country, subdivision, isp } = body[0];
            this.qoeData[id].country = country;
            this.qoeData[id].subdivision = subdivision;
            this.qoeData[id].isp = isp;
          })
      );

    await Promise.all(request);
    return false;
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
    const ids = this.toRequestIds(storageData);
    let error = await this.updateFixedQoe(ids);
    if (error) {
      return [];
    }

    error = await this.updateStatsInfo(ids);
    if (error) {
      return [];
    }
    const subdivisions = this.toSubdivisions();
    await this.updateSubdivision(subdivisions);

    await this.updateHour();

    const result = [];
    storageData.forEach(item => {
      const hasApiData = item.id in this.qoeData;
      const average = [];
      const startTime = new Date(item.data.start_time);

      let data = { qoe: 0.0 };
      if (hasApiData) {
        data = this.qoeData[item.id];
        const { country, subdivision } = data;

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

        const hour = startTime.getHours();
        // 時間のデータが存在する時
        if (hour in this.average.hour) {
          average.push({
            label: `${hour}時`,
            modalLabel: `時間平均: ${hour}時`,
            value: saturateQoe(this.average.hour[hour])
          });
        }
      }

      const dataObject = {
        id: item.id,
        title: item.data.title,
        location: item.data.location,
        thumbnail: item.data.thumbnail,
        qoe: saturateQoe(data.qoe),
        average,
        startTime,
        state: new MeasureState(data.qoe)
      };

      result.push(dataObject);
    });

    return result;
  }

  async toRenderData(storageData) {
    const qoeData = await this.toQoeInclusiveData(storageData);
    return qoeData.sort((a, b) => (a.startTime > b.startTime ? -1 : 1));
  }
  // API

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
