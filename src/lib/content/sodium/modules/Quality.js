import { useStorage } from "./Storage";

export const qualityStatus = ({ sessionId, videoId }) => {
  const {
    date,
    bitrate,
    throughput,
    resolution,
    framerate,
    speed,
    droppedVideoFrames,
    totalVideoFrames,
    timing,
  } = latestQuality({
    sessionId,
    videoId,
  });
  const qoe = latestQoE({ sessionId, videoId });

  return {
    date,
    bitrate,
    throughput: getRealThroughput(throughput),
    transfer: transferSize({ sessionId, videoId }),
    resolution,
    framerate,
    speed,
    droppedVideoFrames,
    totalVideoFrames,
    timing,
    startTime: startTime({ sessionId, videoId }),
    qoe,
    alert:
      Number.isFinite(qoe) &&
      isLowQuality({ droppedVideoFrames, totalVideoFrames }),
  };
};

const latest = (log, key) => {
  const { date, [key]: value } =
    (log || []).filter((a) => key in a).slice(-1)[0] || {};
  return { date, value };
};

export const latestQoE = ({ sessionId, videoId }) => {
  const storage = useStorage({ sessionId, videoId });
  if (storage.cache === undefined) return NaN;
  const { value } = latest(storage.cache.log, "qoe");
  return value == null ? NaN : value;
};

export const latestQuality = ({ sessionId, videoId }) => {
  const storage = useStorage({ sessionId, videoId });
  if (storage.cache === undefined) return "";
  const { date, value } = latest(storage.cache.log, "quality");
  return value == null ? {} : { date, ...value };
};

export const getRealThroughput = (list) => {
  if (!list) return NaN;
  if (!list.length) return NaN;
  return list[list.length - 1].throughput;
};

export const startTime = ({ sessionId, videoId }) => {
  const storage = useStorage({ sessionId, videoId });
  if (storage.cache === undefined) return NaN;
  const time = storage.cache.start_time;
  return time >= 0 ? time : NaN;
};

export const transferSize = ({ sessionId, videoId }) => {
  const storage = useStorage({ sessionId, videoId });
  if (storage.cache === undefined) return NaN;
  const size = storage.cache.transfer_size;
  return size >= 0 ? size : NaN;
};

export const isLowQuality = ({ droppedVideoFrames, totalVideoFrames }) =>
  !(droppedVideoFrames / totalVideoFrames <= 1e-3);
