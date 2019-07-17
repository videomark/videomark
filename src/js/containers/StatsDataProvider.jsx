import fromEntries from "object.fromentries";
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

// FIXME: for chrome version < 73
if (!Object.fromEntries) fromEntries.shim();

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
  qoeFrequency: Object.fromEntries(
    [...Array(5).keys()].map(i => [
      i + 1,
      Object.fromEntries(videoPlatforms.map(({ id }) => [id, 0]))
    ])
  )
};
const reducer = (data, chunk) => ({
  initialState: false,
  length: chunk.length + data.length,
  playingTime: [...chunk.playingTime, ...data.playingTime]
    .sort(({ day: a }, { day: b }) => (a < b ? -1 : +1))
    .reduce((accumulator, { day, value }) => {
      if (accumulator.length === 0) return [{ day, value }];
      const last = accumulator.slice(-1)[0];
      return [
        ...accumulator.slice(0, -1),
        ...(last.day === day
          ? [{ day, value: last.value + value }]
          : [last, { day, value }])
      ];
    }, []),
  qoeStats: {
    sum: chunk.qoeStats.sum + data.qoeStats.sum,
    count: chunk.qoeStats.count + data.qoeStats.count
  },
  qoeTimeline: [...chunk.qoeTimeline, ...data.qoeTimeline],
  qoeFrequency: Object.entries(data.qoeFrequency).reduce(
    (obj, [qoe, stats]) => {
      const pastStats = chunk.qoeFrequency[qoe] || {};
      return {
        ...obj,
        [qoe]: Object.entries(stats).reduce(
          (serviceStats, [service, value]) => ({
            ...serviceStats,
            [service]: value + (pastStats[service] || 0)
          }),
          {}
        )
      };
    },
    {}
  )
});
const getStoredValue = () =>
  JSON.parse(localStorage.getItem("statsData")) || initialData;
const getStoredIndex = () =>
  new Set(JSON.parse(localStorage.getItem("statsDataIndex")) || []);
const store = (index, chunk) => {
  const stored = getStoredValue();
  const storedIndex = getStoredIndex();
  localStorage.setItem("statsData", JSON.stringify(reducer(stored, chunk)));
  localStorage.setItem(
    "statsDataIndex",
    JSON.stringify([...index, ...storedIndex])
  );
};

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
      const storedIndex = getStoredIndex();
      const buffer = viewingModels.filter(
        viewingModel => !storedIndex.has(viewingModel.viewingId)
      );
      const column = {};
      [column.startTime, column.endTime, column.service] = await Promise.all([
        Promise.all(buffer.map(viewingModel => viewingModel.startTime)),
        Promise.all(buffer.map(viewingModel => viewingModel.endTime)),
        Promise.all(
          buffer.map(
            async viewingModel =>
              urlToVideoPlatform(await viewingModel.location).id
          )
        )
      ]);
      const now = Date.now();
      const beforeTenMinutes = time => now - time > 600e3;
      const storeIndex = column.endTime.every(beforeTenMinutes)
        ? buffer.map(viewingModel => viewingModel.viewingId)
        : [];

      [column.quality, column.qoe] = await Promise.all([
        Promise.all(buffer.map(viewingModel => viewingModel.quality)),
        fetchQoE(buffer)
      ]);
      column.qoe = column.qoe.map(value => (value >= 0 ? value : NaN));
      column.date = column.startTime.map(startTime =>
        format(startTime, "yyyy-MM-dd")
      );
      const df = new DataFrame(column).withColumn("playing", row => {
        const endTime = row.get("endTime");
        const { timing } = row.get("quality");
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
              Object.fromEntries(
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
          [(obj, [qoe, serviceStats]) => ({ ...obj, [qoe]: serviceStats }), {}]
        ]
      ]);

      const chunk = {
        length: buffer.length,
        storeIndex,
        playingTime,
        qoeStats: {
          sum: qoeTimeline.reduce((a, { value }) => a + value, 0),
          count: qoeTimeline.length
        },
        qoeTimeline,
        qoeFrequency
      };
      dispatch(chunk);
      await defer.promise;
    }
  });
  return [stream, defer];
};

export const StatsDataContext = createContext();
export const StatsDataProvider = props => {
  const viewings = useContext(ViewingsContext);
  const [data, addData] = useReducer(reducer, initialData);
  const [streamDefer, setStreamDefer] = useState();
  useEffect(() => {
    if (viewings === undefined) return;
    if (!data.initialState) return;

    addData(getStoredValue());
    if (viewings.size <= getStoredIndex().size) return;

    const [stream, defer] = dispatcher(chunk => {
      addData(chunk);
      if (chunk.storeIndex.length > 0) store(chunk.storeIndex, chunk);
    });

    if (viewings.size <= STREAM_BUFFER_SIZE) defer.resolve();
    else setStreamDefer(defer);

    viewingModelsStream(viewings)
      .pipeTo(stream)
      .then(() => setStreamDefer());
  }, [viewings, addData]);
  return (
    <StatsDataContext.Provider
      {...props}
      value={data === undefined ? {} : { streamDefer, ...data }}
    />
  );
};
