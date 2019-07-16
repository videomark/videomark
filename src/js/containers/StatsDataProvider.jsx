import React, {
  createContext,
  useContext,
  useEffect,
  useReducer,
  useState
} from "react";
import DataFrame from "dataframe-js";
import { format } from "date-fns";
import { reduce } from "p-iteration";
import {
  STREAM_BUFFER_SIZE,
  ViewingsContext,
  viewingModelsStream
} from "./ViewingsProvider";
import { urlToVideoPlatform } from "../utils/Utils";
import videoPlatforms from "../utils/videoPlatforms.json";
import Api from "../utils/Api";

const fetchQoE = async viewingModels => {
  if (viewingModels.length === 0) return [];
  if (!window.navigator.onLine)
    return Promise.all(viewingModels.map(viewing => viewing.qoe));
  const response = await Api.fixed(
    viewingModels.map(viewing => ({
      session_id: viewing.sessionId,
      video_id: viewing.videoId
    }))
  );
  const json = response.ok ? await response.json() : undefined;
  return json === undefined
    ? Array(viewingModels.length)
    : Promise.all(
        viewingModels.map(async viewing => {
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

const delay = async (ms = 0) => new Promise(resolve => setTimeout(resolve, ms));
const delayCaller = async (obj, calls) =>
  reduce(
    calls,
    async (accumulator, [method, args]) => {
      await delay();
      return accumulator[method](...args);
    },
    obj
  );

const dispatcher = dispatch => {
  const defer = (() => {
    const ret = {};
    ret.promise = new Promise((resolve, reject) => {
      ret.resolve = resolve;
      ret.reject = reject;
    });
    return ret;
  })();
  const stream = new WritableStream({
    write: async viewingModels => {
      const column = {};
      [
        column.startTime,
        column.service,
        column.quality,
        column.qoe
      ] = await Promise.all([
        Promise.all(viewingModels.map(viewingModel => viewingModel.startTime)),
        Promise.all(
          viewingModels.map(
            async viewingModel =>
              urlToVideoPlatform(await viewingModel.location).id
          )
        ),
        Promise.all(viewingModels.map(viewingModel => viewingModel.quality)),
        fetchQoE(viewingModels)
      ]);
      column.qoe = column.qoe.map(value => (value >= 0 ? value : NaN));
      column.date = column.startTime.map(startTime =>
        format(startTime, "yyyy-MM-dd")
      );
      const df = new DataFrame(column).withColumn("playing", row => {
        const { date: endTime, timing } = row.get("quality");
        const { pause } = timing || {};
        const playing = endTime - row.get("startTime") - pause;
        return Number.isFinite(playing) ? playing : 0;
      });
      const playingTime = await delayCaller(df, [
        ["groupBy", ["date"]],
        ["aggregate", [group => group.stat.sum("playing")]],
        ["toArray", []],
        ["map", [([date, playing]) => ({ day: date, value: playing })]]
      ]);
      const qoeTimeline = await delayCaller(df, [
        ["select", ["service", "startTime", "qoe"]],
        ["dropMissingValues", [["service", "startTime", "qoe"]]],
        ["toArray", []],
        [
          "map",
          [
            ([service, startTime, qoe]) => ({
              service,
              time: startTime.getTime(),
              value: qoe
            })
          ]
        ]
      ]);
      const qoeFrequency = await delayCaller(df, [
        ["select", ["service", "qoe"]],
        ["dropMissingValues", [["service", "qoe"]]],
        ["withColumn", ["qoe", row => Math.ceil(row.get("qoe"))]],
        ["groupBy", ["qoe"]],
        [
          "aggregate",
          [
            group =>
              new Map(
                group
                  .groupBy("service")
                  .aggregate(serviceGroup => serviceGroup.count())
                  .toArray()
              )
          ]
        ],
        ["toArray", []],
        [
          "reduce",
          [(map, [qoe, serviceStats]) => map.set(qoe, serviceStats), new Map()]
        ]
      ]);
      dispatch({
        length: viewingModels.length,
        playingTime,
        qoeStats: {
          sum: qoeTimeline.reduce((a, { value }) => a + value, 0),
          count: qoeTimeline.length
        },
        qoeTimeline,
        qoeFrequency
      });
      await defer.promise;
    }
  });
  return [stream, defer];
};

export const StatsDataContext = createContext();
export const StatsDataProvider = props => {
  const viewings = useContext(ViewingsContext);
  const [data, addData] = useReducer(reducer, initialData);
  const [defer, setDefer] = useState();
  useEffect(() => {
    if (viewings !== undefined && data.initialState) {
      const [stream, streamDefer] = dispatcher(addData);
      if (STREAM_BUFFER_SIZE < viewings.size) setDefer(streamDefer);
      else streamDefer.resolve();
      viewingModelsStream(viewings)
        .pipeTo(stream)
        .then(() => setDefer());
    }
  }, [viewings, addData]);
  return (
    <StatsDataContext.Provider
      {...props}
      value={data === undefined ? {} : { defer, ...data }}
    />
  );
};
