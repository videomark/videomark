/* eslint no-bitwise: 0 */

export const createKey = () => {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0;

    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

export const isDevelop = () => process.env.NODE_ENV === "development";

export const Services = {
  youtube: "youtube",
  paravi: "paravi",
  tver: "tver"
};

export const LocationToService = location => {
  const url = new window.URL(location);
  let result = "";
  if (url.host.includes("youtube")) {
    result = Services.youtube;
  } else if (url.host.includes("paravi")) {
    result = Services.paravi;
  } else if (url.host.includes("tver")) {
    result = Services.tver;
  }
  return result;
};

export const viewingIdWithoutDateTimeFromSessionAndVideo = (session, video) => {
  return `${session}_${video}`;
};
// viewingIDをserssion + videoに分解
export const viewingIdWithoutDateTimeFromViewintId = viewingId => {
  const splitData = viewingId.split("_");
  return viewingIdWithoutDateTimeFromSessionAndVideo(
    splitData[0],
    splitData[1]
  );
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

export default createKey;
