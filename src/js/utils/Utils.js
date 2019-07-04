import videoPlatforms from "./videoPlatforms.json";

export const urlToVideoPlatform = url => {
  try {
    const { host } = new URL(url);
    return videoPlatforms.find(({ id }) => host.includes(id)) || {};
  } catch (e) {
    if (e instanceof TypeError) return {};
    throw e;
  }
};

export const viewingIdWithoutDateTimeFromSessionAndVideo = (session, video) => {
  return `${session}_${video}`;
};

export const viewingIdToSessionAndVideo = viewingId => {
  const splitData = viewingId.split("_");
  return {
    session: splitData[0],
    video: splitData[1]
  };
};

export const isMobile = () =>
  window.sodium !== undefined && window.chrome.storage !== undefined;
export const isExtension = () =>
  window.sodium === undefined && window.chrome.storage !== undefined;
export const isWeb = () =>
  window.sodium === undefined && window.chrome.storage === undefined;
