import React, { createContext, useReducer, useEffect } from "react";
import { Redirect } from "react-router";
import DataFrame from "dataframe-js";
import { format } from "date-fns";
import ChromeExtensionWrapper from "../utils/ChromeExtensionWrapper";
import ViewingModel from "../utils/Viewing";
import { urlToVideoPlatform } from "../utils/Utils";
import videoPlatforms from "../utils/videoPlatforms.json";

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
    const buffer = this.ids.splice(-10).map(id => new ViewingModel(id));
    await Promise.all(buffer.map(viewing => viewing.init()));
    const column = {};
    [
      column.startTime,
      column.location,
      // column.qoe,
      column.quality
    ] = await Promise.all([
      Promise.all(buffer.map(viewing => viewing.startTime)),
      Promise.all(buffer.map(viewing => viewing.location)),
      // Promise.all(buffer.map(viewing => viewing.qoe)),
      Promise.all(buffer.map(viewing => viewing.quality))
    ]);
    // column.qoe = column.qoe.map(value => (value >= 0 ? value : NaN))
    const serviceNames = new Map(
      videoPlatforms.map(({ id, name }) => [id, name])
    );
    column.service = column.location.map(
      location => urlToVideoPlatform(location).id
    );
    column.serviceName = column.service.map(service =>
      serviceNames.get(service)
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
    controller.enqueue({
      length: buffer.length,
      playingTime: df
        .groupBy("date")
        .aggregate(group => group.stat.sum("playing"))
        .toArray()
        .map(([date, playingTime]) => ({ day: date, value: playingTime }))
      // qoeTimeline: df
      //   .select("service", "startTime", "qoe")
      //   .dropMissingValues(["service", "startTime", "qoe"])
      //   .toArray()
      //   .map(([service, startTime, qoe]) => ({
      //     service,
      //     time: startTime.getTime(),
      //     value: qoe
      //   })),
      // qoeFrequency: df
      //   .select("serviceName", "qoe")
      //   .dropMissingValues(["serviceName", "qoe"])
      //   .map(row => row.set("qoe", Math.ceil(row.get("qoe"))))
      //   .groupBy("qoe")
      //   .aggregate(group =>
      //     Object.fromEntries(
      //       group
      //         .groupBy("serviceName")
      //         .aggregate(serviceGroup => serviceGroup.count())
      //         .toArray()
      //     )
      //   )
      //   .toArray()
      //   .map(([qoe, serviceStats]) => ({ qoe, ...serviceStats }))
    });
    await new Promise(resolve => setTimeout(resolve, 100));
  }
});
const initialData = {
  initialState: true,
  length: 0,
  playingTime: []
};
const reducer = (data, chunk) => ({
  initialState: false,
  length: chunk.length + data.length,
  playingTime: ((current, past) => {
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
  })(data.playingTime, chunk.playingTime)
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
  if (!data.initialState && data.length === 0) {
    return <Redirect to="/welcome" />;
  }
  return (
    <DataContext.Provider {...props} value={data === undefined ? {} : data} />
  );
};
export default DataProvider;
