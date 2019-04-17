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
