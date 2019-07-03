import React, { createContext, useReducer, useEffect } from "react";
import DataFrame from "dataframe-js";
import { format } from "date-fns";
import ChromeExtensionWrapper from "../utils/ChromeExtensionWrapper";
import ViewingModel from "../utils/Viewing";
import { urlToVideoPlatform } from "../utils/Utils";
import videoPlatforms from "../utils/videoPlatforms.json";
import Api from "../utils/Api";

const fetchQoE = async viewings => {
  if (viewings.length === 0) return [];
  if (!window.navigator.onLine)
    return Promise.all(viewings.map(viewing => viewing.qoe));
  const response = await Api.fixed(
    viewings.map(viewing => ({
      session_id: viewing.sessionId,
      video_id: viewing.videoId
    }))
  );
  const json = response.ok ? await response.json() : undefined;
  return json === undefined
    ? Array(viewings.length)
    : Promise.all(
        viewings.map(async viewing => {
          const { qoe } =
            json.find(({ viewing_id: id }) =>
              id.startsWith(viewing.viewingId)
            ) || {};
          await viewing.save({
            qoe
          });
          return qoe;
        })
      );
};

const viewingsStream = new ReadableStream({
  async start() {
    this.ids = (await new Promise(resolve => {
      ChromeExtensionWrapper.loadVideoIds(resolve);
    }))
      .map(
        ({
          data: {
            session_id: sessionId,
            video_id: videoId,
            start_time: startTime
          }
        }) => ({
          sessionId,
          videoId,
          startTime
        })
      )
      .sort(({ startTime: a }, { startTime: b }) => a - b);
  },
  async pull(controller) {
    const buffer = this.ids.splice(-120).map(id => new ViewingModel(id));
    await Promise.all(buffer.map(viewing => viewing.init()));

    const column = {};
    [
      column.startTime,
      column.location,
      column.quality,
      column.qoe
    ] = await Promise.all([
      Promise.all(buffer.map(viewing => viewing.startTime)),
      Promise.all(buffer.map(viewing => viewing.location)),
      Promise.all(buffer.map(viewing => viewing.quality)),
      fetchQoE(buffer)
    ]);
    column.qoe = column.qoe.map(value => (value >= 0 ? value : NaN));
    column.service = column.location.map(
      location => urlToVideoPlatform(location).id
    );
    column.date = column.startTime.map(startTime =>
      format(startTime, "yyyy-MM-dd")
    );
    const df = new DataFrame(column).withColumn("playing", row => {
      const { date: endTime, timing } = row.get("quality");
      const { pause } = timing || {};
      const playing = endTime - row.get("startTime") - pause;
      return Number.isFinite(playing) ? playing : 0;
    });
    const qoeTimeline = df
      .select("service", "startTime", "qoe")
      .dropMissingValues(["service", "startTime", "qoe"])
      .toArray()
      .map(([service, startTime, qoe]) => ({
        service,
        time: startTime.getTime(),
        value: qoe
      }));
    controller.enqueue({
      length: buffer.length,
      playingTime: df
        .groupBy("date")
        .aggregate(group => group.stat.sum("playing"))
        .toArray()
        .map(([date, playingTime]) => ({ day: date, value: playingTime })),
      qoeStats: {
        sum: qoeTimeline.reduce((a, { value }) => a + value, 0),
        count: qoeTimeline.length
      },
      qoeTimeline,
      qoeFrequency: df
        .select("service", "qoe")
        .dropMissingValues(["service", "qoe"])
        .withColumn("qoe", row => Math.ceil(row.get("qoe")))
        .groupBy("qoe")
        .aggregate(
          group =>
            new Map(
              group
                .groupBy("service")
                .aggregate(serviceGroup => serviceGroup.count())
                .toArray()
            )
        )
        .toArray()
        .reduce((map, [qoe, serviceStats]) => {
          return map.set(qoe, serviceStats);
        }, new Map())
    });
    await new Promise(resolve => setTimeout(resolve, 500));
  }
});
const initialData = {
  initialState: true,
  length: 0,
  playingTime: [],
  qoeStats: {
    sum: 0,
    count: 0
  },
  qoeTimeline: [],
  qoeFrequency: new Map(
    [...Array(5).keys()].map(i => [
      i + 1,
      new Map(videoPlatforms.map(({ id }) => [id, 0]))
    ])
  )
};
const reducer = (data, chunk) => ({
  initialState: false,
  length: chunk.length + data.length,
  playingTime: (({ playingTime: current }, { playingTime: past }) => {
    if (
      current.length > 0 &&
      past.length > 0 &&
      current[0].day === past.slice(-1)[0].day
    )
      return [
        ...past.slice(0, -1),
        {
          ...current[0],
          value: current[0].value + past.slice(-1)[0].value
        },
        ...current.slice(1)
      ];
    return [...past, ...current];
  })(data, chunk),
  qoeStats: (({ qoeStats: current }, { qoeStats: past }) => ({
    sum: past.sum + current.sum,
    count: past.count + current.count
  }))(data, chunk),
  qoeTimeline: (({ qoeTimeline: current }, { qoeTimeline: past }) => [
    ...past,
    ...current
  ])(data, chunk),
  qoeFrequency: (({ qoeFrequency: current }, { qoeFrequency: past }) =>
    [...current].reduce((qoeMap, [qoe, stats]) => {
      const pastStats = past.get(qoe) || new Map();
      return qoeMap.set(
        qoe,
        [...stats].reduce(
          (serviceMap, [service, value]) =>
            serviceMap.set(service, value + (pastStats.get(service) || 0)),
          new Map()
        )
      );
    }, new Map()))(data, chunk)
});
const dispatcher = f =>
  new WritableStream({
    write: chunk => f(chunk)
  });

export const DataContext = createContext();
export const DataProvider = props => {
  const [data, addData] = useReducer(reducer, initialData);
  useEffect(() => {
    if (data.initialState) {
      viewingsStream.pipeTo(dispatcher(addData));
    }
  }, [addData]);
  return (
    <DataContext.Provider {...props} value={data === undefined ? {} : data} />
  );
};
export default DataProvider;
