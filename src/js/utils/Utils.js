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

export const isDevelop = () => process.env.NODE_ENV === "development";
export const isMobile = () =>
  !isDevelop() && chrome !== undefined && !process.env.PUBLIC_URL;
export const isExtension = () =>
  !isDevelop() && chrome !== undefined && process.env.PUBLIC_URL.length > 0;
