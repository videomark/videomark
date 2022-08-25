import React, {
  createContext,
  useContext,
  useEffect,
  useReducer,
  useState,
} from "react";
import DataFrame from "dataframe-js";
import { format } from "date-fns";
import { reduce } from "p-iteration";
import { WritableStream } from "web-streams-polyfill/ponyfill";
import {
  STREAM_BUFFER_SIZE,
  ViewingsContext,
  viewingModelsStream,
} from "./ViewingsProvider";
import { urlToVideoPlatform } from "../utils/Utils";
import videoPlatforms from "../utils/videoPlatforms";
import Api from "../utils/Api";

const fetchQoE = async (viewingModels) => {
  const getQoE = async () => {
    return Promise.all(viewingModels.map(({ qoe }) => qoe));
  };

  const request = viewingModels
    .filter(({ qoeCalculatable }) => qoeCalculatable)
    .map(({ sessionId, videoId }) => ({
      session_id: sessionId,
      video_id: videoId,
    }));

  if (request.length === 0) return getQoE();
  if (!window.navigator.onLine) return getQoE();

  const response = await Api.fixed(request);

  if (!response.ok) return getQoE();

  const json = await response.json();
  const table = new Map(
    json.map(({ viewing_id: key, qoe: value }) => [
      key.slice(0, 73), // NOTE: ハイフン4つを含むUUID 36文字 x 2 + "_" 1文字
      value,
    ])
  );

  return Promise.all(
    viewingModels.map(async (viewing) => {
      const qoe = table.get(viewing.viewingId);

      if (qoe != null) await viewing.save({ qoe });

      return qoe;
    })
  );
};

const initialData = {
  /** Stats data structure version. */
  version: 1,
  initialState: true,
  length: 0,
  playingTime: [],
  transferSize: [],
  totalPlayingTime: 0,
  totalWaitingTime: 0,
  droppedVideoFrames: 0,
  totalVideoFrames: 0,
  qoeStats: {
    sum: 0,
    count: 0,
  },
  qoeTimeline: [],
  qoeFrequency: Object.fromEntries(
    [...Array(41).keys()].map((i) => [
      10 + i,
      Object.fromEntries(videoPlatforms.map(({ id }) => [id, 0])),
    ])
  ),
};
const reducer = (data, chunk) => ({
  initialState: false,
  version: data.version,
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
          : [last, { day, value }]),
      ];
    }, []),
  transferSize: [...chunk.transferSize, ...data.transferSize]
    .sort(({ day: a }, { day: b }) => (a < b ? -1 : +1))
    .reduce((accumulator, { day, value }) => {
      if (accumulator.length === 0) return [{ day, value }];
      const last = accumulator.slice(-1)[0];
      return [
        ...accumulator.slice(0, -1),
        ...(last.day === day
          ? [{ day, value: last.value + value }]
          : [last, { day, value }]),
      ];
    }, []),
  totalPlayingTime: chunk.totalPlayingTime + data.totalPlayingTime,
  totalWaitingTime: chunk.totalWaitingTime + data.totalWaitingTime,
  droppedVideoFrames: chunk.droppedVideoFrames + data.droppedVideoFrames,
  totalVideoFrames: chunk.totalVideoFrames + data.totalVideoFrames,
  qoeStats: {
    sum: chunk.qoeStats.sum + data.qoeStats.sum,
    count: chunk.qoeStats.count + data.qoeStats.count,
  },
  qoeTimeline: [
    ...chunk.qoeTimeline,
    ...data.qoeTimeline,
  ].sort(({ time: a }, { time: b }) => (a < b ? -1 : +1)),
  qoeFrequency: Object.entries(data.qoeFrequency).reduce(
    (obj, [qoe, stats]) => {
      const pastStats = chunk.qoeFrequency[qoe] || {};
      return {
        ...obj,
        [qoe]: Object.entries(stats).reduce(
          (serviceStats, [service, value]) => ({
            ...serviceStats,
            [service]: value + (pastStats[service] || 0),
          }),
          {}
        ),
      };
    },
    {}
  ),
});
const getStoredValue = () =>
  JSON.parse(localStorage.getItem("statsData")) || initialData;
export const getStoredIndex = () =>
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
export const clearStore = () => {
  localStorage.removeItem("statsData");
  localStorage.removeItem("statsDataIndex");
};

const delay = async (ms = 0) =>
  new Promise((resolve) => setTimeout(resolve, ms));
const delayCaller = async (obj, calls) =>
  reduce(
    calls,
    async (accumulator, [method, args]) => {
      await delay();
      return accumulator[method](...args);
    },
    obj
  );

const dispatcher = (dispatch) => {
  const defer = (() => {
    const ret = {};
    ret.promise = new Promise((resolve, reject) => {
      ret.resolve = resolve;
      ret.reject = reject;
    });
    return ret;
  })();
  const stream = new WritableStream({
    write: async (viewingModels) => {
      const column = {
        index: viewingModels.map((viewingModel) => viewingModel.id),
      };
      [
        column.startTime,
        column.endTime,
        column.service,
        column.transferSize,
      ] = await Promise.all([
        Promise.all(
          viewingModels.map((viewingModel) => viewingModel.startTime)
        ),
        Promise.all(viewingModels.map((viewingModel) => viewingModel.endTime)),
        Promise.all(
          viewingModels.map(
            async (viewingModel) =>
              urlToVideoPlatform(await viewingModel.location).id
          )
        ),
        Promise.all(
          viewingModels.map((viewingModel) => viewingModel.transferSize)
        ),
      ]);
      const now = Date.now();
      const beforeTenMinutes = (time) => now - time > 600e3;
      const storeIndex = column.endTime.every(beforeTenMinutes)
        ? column.index
        : [];

      [column.quality, column.qoe] = await Promise.all([
        Promise.all(viewingModels.map((viewingModel) => viewingModel.quality)),
        fetchQoE(viewingModels),
      ]);
      column.qoe = column.qoe.map((value) => (value >= 0 ? value : NaN));
      column.date = column.startTime.map((startTime) =>
        format(startTime, "yyyy-MM-dd")
      );
      column.month = column.startTime.map((startTime) =>
        format(startTime, "yyyy-MM")
      );
      const df = new DataFrame(column).withColumn("playing", (row) => {
        const { timing } = row.get("quality");
        const { pause } = timing || { pause: 0 };
        const playing = row.get("endTime") - row.get("startTime") - pause;
        return Number.isFinite(playing) ? playing : 0;
      });
      const playingTime = await delayCaller(df, [
        ["groupBy", ["date"]],
        ["aggregate", [(group) => group.stat.sum("playing")]],
        ["toArray", []],
        ["map", [([date, playing]) => ({ day: date, value: playing })]],
      ]);
      const tdf = new DataFrame(column).withColumn("transferSize", (row) => {
        const transfer = row.get("transferSize");
        return Number.isFinite(transfer) ? transfer : 0;
      });
      const transferSize = await delayCaller(tdf, [
        ["groupBy", ["month"]],
        ["aggregate", [(group) => group.stat.sum("transferSize")]],
        ["toArray", []],
        ["map", [([month, transfer]) => ({ day: month, value: transfer })]],
      ]);
      const {
        totalPlayingTime,
        totalWaitingTime,
        droppedVideoFrames,
        totalVideoFrames,
      } = df.reduce(
        (acc, row) => {
          const playing = row.get("playing");
          const {
            droppedVideoFrames: dropped,
            totalVideoFrames: frames,
            timing,
          } = row.get("quality");
          const { waiting } = timing || { waiting: 0 };

          return {
            totalPlayingTime:
              acc.totalPlayingTime + Number.isFinite(playing) ? playing : 0,
            totalWaitingTime:
              acc.totalWaitingTime + Number.isFinite(waiting) ? waiting : 0,
            droppedVideoFrames:
              acc.droppedVideoFrames + Number.isFinite(dropped) ? dropped : 0,
            totalVideoFrames:
              acc.totalVideoFrames + Number.isFinite(frames) ? frames : 0,
          };
        },
        {
          totalPlayingTime: 0,
          totalWaitingTime: 0,
          droppedVideoFrames: 0,
          totalVideoFrames: 0,
        }
      );
      const qoeTimeline = await delayCaller(df, [
        ["select", ["index", "service", "startTime", "qoe"]],
        ["dropMissingValues", [["index", "service", "startTime", "qoe"]]],
        ["toArray", []],
        [
          "map",
          [
            ([id, service, startTime, qoe]) => ({
              id,
              service,
              time: startTime.getTime(),
              value: qoe,
            }),
          ],
        ],
      ]);
      const qoeFrequency = await delayCaller(df, [
        ["select", ["service", "qoe"]],
        ["dropMissingValues", [["service", "qoe"]]],
        ["withColumn", ["qoe", (row) => Math.floor(row.get("qoe") * 10)]],
        ["groupBy", ["qoe"]],
        [
          "aggregate",
          [
            (group) =>
              Object.fromEntries(
                group
                  .groupBy("service")
                  .aggregate((serviceGroup) => serviceGroup.count())
                  .toArray()
              ),
          ],
        ],
        ["toArray", []],
        [
          "reduce",
          [(obj, [qoe, serviceStats]) => ({ ...obj, [qoe]: serviceStats }), {}],
        ],
      ]);

      const chunk = {
        length: viewingModels.length,
        storeIndex,
        playingTime,
        transferSize,
        totalPlayingTime,
        totalWaitingTime,
        droppedVideoFrames,
        totalVideoFrames,
        qoeStats: {
          sum: qoeTimeline.reduce((a, { value }) => a + value, 0),
          count: qoeTimeline.length,
        },
        qoeTimeline,
        qoeFrequency,
      };
      dispatch(chunk);
      await defer.promise;
    },
  });
  return [stream, defer];
};

export const StatsDataContext = createContext();
export const StatsDataProvider = (props) => {
  const viewings = useContext(ViewingsContext);
  const [data, addData] = useReducer(reducer, initialData);
  const [streamDefer, setStreamDefer] = useState();
  useEffect(() => {
    if (viewings === undefined) return;
    if (!data.initialState) return;

    // NOTE: 古いキャッシュが存在する場合、削除する
    if (getStoredValue().version !== initialData.version) clearStore();

    const tmp = new Map(viewings);
    const storedIndex = getStoredIndex();
    addData(getStoredValue());

    storedIndex.forEach((index) => tmp.delete(index));
    if (tmp.size === 0) return;

    const [stream, defer] = dispatcher((chunk) => {
      addData(chunk);
      if (chunk.storeIndex.length > 0) store(chunk.storeIndex, chunk);
    });
    if (tmp.size <= STREAM_BUFFER_SIZE) defer.resolve();
    else setStreamDefer(defer);

    viewingModelsStream(tmp)
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
