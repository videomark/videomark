/* eslint-disable no-use-before-define */

import { useStorage } from './Storage';

export const getLatestStats = ({ sessionId, videoId }) => {
  if (!sessionId || !videoId) {
    return {};
  }

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
    transferSize: transferSize({ sessionId, videoId }),
    resolution,
    framerate,
    speed,
    droppedVideoFrames,
    totalVideoFrames,
    timing,
    startTime: startTime({ sessionId, videoId }),
    qoe,
    isLowQuality: Number.isFinite(qoe) && isLowQuality({ droppedVideoFrames, totalVideoFrames }),
  };
};

const latest = (log, key) => {
  const { date, [key]: value } = (log || []).filter((a) => key in a).slice(-1)[0] || {};

  return { date, value };
};

export const latestQoE = ({ sessionId, videoId }) => {
  const storage = useStorage({ sessionId, videoId });

  if (storage.statCache === undefined) {
    return NaN;
  }

  const { value } = latest(storage.statCache.logs, 'qoe');

  return value === null ? NaN : value;
};

export const latestQuality = ({ sessionId, videoId }) => {
  const storage = useStorage({ sessionId, videoId });

  if (storage.statCache === undefined) {
    return '';
  }

  const { date, value } = latest(storage.statCache.logs, 'quality');

  return value === null ? {} : { date, ...value };
};

export const getRealThroughput = (list) => {
  if (!list) {
    return NaN;
  }

  if (!list.length) {
    return NaN;
  }

  return list[list.length - 1].throughput;
};

export const startTime = ({ sessionId, videoId }) => {
  const storage = useStorage({ sessionId, videoId });

  if (storage.recordCache === undefined) {
    return NaN;
  }

  const time = storage.recordCache.startTime;

  return time >= 0 ? time : NaN;
};

export const transferSize = ({ sessionId, videoId }) => {
  const storage = useStorage({ sessionId, videoId });

  if (storage.statCache === undefined) {
    return NaN;
  }

  const size = storage.statCache.transferSize;

  return size >= 0 ? size : NaN;
};

export const isLowQuality = ({ droppedVideoFrames, totalVideoFrames }) =>
  !(droppedVideoFrames / totalVideoFrames <= 1e-3);
