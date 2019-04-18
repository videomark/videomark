import videoPlatforms from "./videoPlatforms.json";

export const isDevelop = () => process.env.NODE_ENV === "development";

export const urlToVideoPlatform = url =>
  videoPlatforms.find(({ id }) => new window.URL(url).host.includes(id)) || {};

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

export const isMobile = () => {
  if (isDevelop()) {
    return false;
  }

  const publicUrl = process.env.PUBLIC_URL;
  return publicUrl === "";
};
