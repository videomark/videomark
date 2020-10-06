import React, {
  createContext,
  useContext,
  useEffect,
  useReducer,
  useState,
} from "react";
// @ts-expect-error ts-migrate(7016) FIXME: Try `npm install @types/dataframe-js` if it exists... Remove this comment to see the full error message
import DataFrame from "dataframe-js";
import { format } from "date-fns";
import { reduce } from "p-iteration";
import {
  STREAM_BUFFER_SIZE,
  ViewingsContext,
  viewingModelsStream,
// @ts-expect-error ts-migrate(6142) FIXME: Module './ViewingsProvider' was resolved to '/home... Remove this comment to see the full error message
} from "./ViewingsProvider";
import { urlToVideoPlatform } from "../utils/Utils";
import videoPlatforms from "../utils/videoPlatforms";
import Api from "../utils/Api";

const fetchQoE = async (viewingModels: any) => {
  const getQoE = async () => {
    return Promise.all(viewingModels.map(({
      qoe
    }: any) => qoe));
  };

  const request = viewingModels
    .filter(({
    qoeCalculatable
  }: any) => qoeCalculatable)
    .map(({
    sessionId,
    videoId
  }: any) => ({
      session_id: sessionId,
      video_id: videoId,
    }));

  if (request.length === 0) return getQoE();
  if (!window.navigator.onLine) return getQoE();

  const response = await Api.fixed(request);

  if (!response.ok) return getQoE();

  const json = await response.json();
  const table = new Map(
    // @ts-expect-error ts-migrate(7031) FIXME: Binding element 'key' implicitly has an 'any' type... Remove this comment to see the full error message
    json.map(({ viewing_id: key, qoe: value }) => [
      key.slice(0, 73), // NOTE: ハイフン4つを含むUUID 36文字 x 2 + "_" 1文字
      value,
    ])
  );

  return Promise.all(
    viewingModels.map(async (viewing: any) => {
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
  // @ts-expect-error ts-migrate(2339) FIXME: Property 'fromEntries' does not exist on type 'Obj... Remove this comment to see the full error message
  qoeFrequency: Object.fromEntries(
    // @ts-expect-error ts-migrate(2569) FIXME: Type 'IterableIterator<number>' is not an array ty... Remove this comment to see the full error message
    [...Array(41).keys()].map((i) => [
      10 + i,
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'fromEntries' does not exist on type 'Obj... Remove this comment to see the full error message
      Object.fromEntries(videoPlatforms.map(({ id }) => [id, 0])),
    ])
  ),
};
const reducer = (data: any, chunk: any) => ({
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
        // @ts-expect-error ts-migrate(2769) FIXME: Argument of type 'unknown' is not assignable to pa... Remove this comment to see the full error message
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
  // @ts-expect-error ts-migrate(2345) FIXME: Type 'null' is not assignable to type 'string'.
  JSON.parse(localStorage.getItem("statsData")) || initialData;
export const getStoredIndex = () =>
  // @ts-expect-error ts-migrate(2345) FIXME: Type 'null' is not assignable to type 'string'.
  new Set(JSON.parse(localStorage.getItem("statsDataIndex")) || []);
const store = (index: any, chunk: any) => {
  const stored = getStoredValue();
  const storedIndex = getStoredIndex();
  localStorage.setItem("statsData", JSON.stringify(reducer(stored, chunk)));
  localStorage.setItem(
    "statsDataIndex",
    // @ts-expect-error ts-migrate(2569) FIXME: Type 'Set<unknown>' is not an array type or a stri... Remove this comment to see the full error message
    JSON.stringify([...index, ...storedIndex])
  );
};
export const clearStore = () => {
  localStorage.removeItem("statsData");
  localStorage.removeItem("statsDataIndex");
};

const delay = async (ms = 0) =>
  new Promise((resolve) => setTimeout(resolve, ms));
const delayCaller = async (obj: any, calls: any) =>
  reduce(
    calls,
    // @ts-expect-error ts-migrate(2345) FIXME: Type 'unknown' is not assignable to type '[any, an... Remove this comment to see the full error message
    async (accumulator, [method, args]) => {
      await delay();
      return accumulator[method](...args);
    },
    obj
  );

const dispatcher = (dispatch: any) => {
  const defer = (() => {
    const ret = {};
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'promise' does not exist on type '{}'.
    ret.promise = new Promise((resolve, reject) => {
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'resolve' does not exist on type '{}'.
      ret.resolve = resolve;
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'reject' does not exist on type '{}'.
      ret.reject = reject;
    });
    return ret;
  })();
  const stream = new WritableStream({
    write: async (viewingModels) => {
      const column = {
        index: viewingModels.map((viewingModel: any) => viewingModel.id),
      };
      [
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'startTime' does not exist on type '{ ind... Remove this comment to see the full error message
        column.startTime,
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'endTime' does not exist on type '{ index... Remove this comment to see the full error message
        column.endTime,
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'service' does not exist on type '{ index... Remove this comment to see the full error message
        column.service,
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'transferSize' does not exist on type '{ ... Remove this comment to see the full error message
        column.transferSize,
      ] = await Promise.all([
        Promise.all(
          viewingModels.map((viewingModel: any) => viewingModel.startTime)
        ),
        Promise.all(viewingModels.map((viewingModel: any) => viewingModel.endTime)),
        Promise.all(
          viewingModels.map(
            // @ts-expect-error ts-migrate(2339) FIXME: Property 'id' does not exist on type '{}'.
            async (viewingModel: any) => urlToVideoPlatform(await viewingModel.location).id
          )
        ),
        Promise.all(
          viewingModels.map((viewingModel: any) => viewingModel.transferSize)
        ),
      ]);
      const now = Date.now();
      const beforeTenMinutes = (time: any) => now - time > 600e3;
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'endTime' does not exist on type '{ index... Remove this comment to see the full error message
      const storeIndex = column.endTime.every(beforeTenMinutes)
        ? column.index
        : [];

      // @ts-expect-error ts-migrate(2339) FIXME: Property 'quality' does not exist on type '{ index... Remove this comment to see the full error message
      [column.quality, column.qoe] = await Promise.all([
        Promise.all(viewingModels.map((viewingModel: any) => viewingModel.quality)),
        fetchQoE(viewingModels),
      ]);
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'qoe' does not exist on type '{ index: an... Remove this comment to see the full error message
      column.qoe = column.qoe.map((value: any) => value >= 0 ? value : NaN);
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'date' does not exist on type '{ index: a... Remove this comment to see the full error message
      column.date = column.startTime.map((startTime: any) => format(startTime, "yyyy-MM-dd")
      );
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'month' does not exist on type '{ index: ... Remove this comment to see the full error message
      column.month = column.startTime.map((startTime: any) => format(startTime, "yyyy-MM")
      );
      const df = new DataFrame(column).withColumn("playing", (row: any) => {
        const { timing } = row.get("quality");
        const { pause } = timing || { pause: 0 };
        const playing = row.get("endTime") - row.get("startTime") - pause;
        return Number.isFinite(playing) ? playing : 0;
      });
      const playingTime = await delayCaller(df, [
        ["groupBy", ["date"]],
        ["aggregate", [(group: any) => group.stat.sum("playing")]],
        ["toArray", []],
        // @ts-expect-error ts-migrate(7031) FIXME: Binding element 'date' implicitly has an 'any' typ... Remove this comment to see the full error message
        ["map", [([date, playing]) => ({ day: date, value: playing })]],
      ]);
      const tdf = new DataFrame(column).withColumn("transferSize", (row: any) => {
        const transfer = row.get("transferSize");
        return Number.isFinite(transfer) ? transfer : 0;
      });
      const transferSize = await delayCaller(tdf, [
        ["groupBy", ["month"]],
        ["aggregate", [(group: any) => group.stat.sum("transferSize")]],
        ["toArray", []],
        // @ts-expect-error ts-migrate(7031) FIXME: Binding element 'month' implicitly has an 'any' ty... Remove this comment to see the full error message
        ["map", [([month, transfer]) => ({ day: month, value: transfer })]],
      ]);
      const {
        totalPlayingTime,
        totalWaitingTime,
        droppedVideoFrames,
        totalVideoFrames,
      } = df.reduce(
        (acc: any, row: any) => {
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
            // @ts-expect-error ts-migrate(7031) FIXME: Binding element 'id' implicitly has an 'any' type.
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
        ["withColumn", ["qoe", (row: any) => Math.floor(row.get("qoe") * 10)]],
        ["groupBy", ["qoe"]],
        [
          "aggregate",
          [
            // @ts-expect-error ts-migrate(2339) FIXME: Property 'fromEntries' does not exist on type 'Obj... Remove this comment to see the full error message
            (group: any) => Object.fromEntries(
              group
                .groupBy("service")
                .aggregate((serviceGroup: any) => serviceGroup.count())
                .toArray()
            ),
          ],
        ],
        ["toArray", []],
        [
          "reduce",
          // @ts-expect-error ts-migrate(7031) FIXME: Binding element 'qoe' implicitly has an 'any' type... Remove this comment to see the full error message
          [(obj: any, [qoe, serviceStats]) => ({ ...obj, [qoe]: serviceStats }), {}],
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
          sum: qoeTimeline.reduce((a: any, {
            value
          }: any) => a + value, 0),
          count: qoeTimeline.length,
        },
        qoeTimeline,
        qoeFrequency,
      };
      dispatch(chunk);
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'promise' does not exist on type '{}'.
      await defer.promise;
    },
  });
  return [stream, defer];
};

// @ts-expect-error ts-migrate(2554) FIXME: Expected 1 arguments, but got 0.
export const StatsDataContext = createContext();
export const StatsDataProvider = (props: any) => {
  const viewings = useContext(ViewingsContext);
  const [data, addData] = useReducer(reducer, initialData);
  const [streamDefer, setStreamDefer] = useState();
  useEffect(() => {
    if (viewings === undefined) return;
    if (!data.initialState) return;

    // NOTE: 古いキャッシュが存在する場合、削除する
    if (getStoredValue().version !== initialData.version) clearStore();

    // @ts-expect-error ts-migrate(2769) FIXME: Type 'unknown' is not assignable to type 'readonly... Remove this comment to see the full error message
    const tmp = new Map(viewings);
    const storedIndex = getStoredIndex();
    addData(getStoredValue());

    storedIndex.forEach((index) => tmp.delete(index));
    if (tmp.size === 0) return;

    const [stream, defer] = dispatcher((chunk: any) => {
      addData(chunk);
      if (chunk.storeIndex.length > 0) store(chunk.storeIndex, chunk);
    });
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'resolve' does not exist on type '{}'.
    if (tmp.size <= STREAM_BUFFER_SIZE) defer.resolve();
    // @ts-expect-error ts-migrate(2345) FIXME: Type '{}' provides no match for the signature '(pr... Remove this comment to see the full error message
    else setStreamDefer(defer);

    viewingModelsStream(tmp)
      .pipeTo(stream)
      // @ts-expect-error ts-migrate(2554) FIXME: Expected 1 arguments, but got 0.
      .then(() => setStreamDefer());
  }, [viewings, addData]);
  return (
    // @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
    <StatsDataContext.Provider
      {...props} // eslint-disable-line react/jsx-props-no-spreading
      value={data === undefined ? {} : { streamDefer, ...data }}
    />
  );
};
