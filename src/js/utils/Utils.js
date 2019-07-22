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

export const isDevelop = () => process.env.NODE_ENV === "development";
export const isMobile = () =>
  window.sodium !== undefined && window.chrome.storage === undefined;
export const isExtension = () =>
  window.sodium === undefined && window.chrome.storage !== undefined;
export const isWeb = () =>
  window.sodium === undefined && window.chrome.storage === undefined;
