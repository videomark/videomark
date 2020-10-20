import videoPlatforms from "./videoPlatforms";

export const urlToVideoPlatform = (url: any) => {
  try {
    const { host } = new URL(url);
    return videoPlatforms.find((platform) => platform.host.test(host)) || {};
  } catch (e) {
    if (e instanceof TypeError) return {};
    throw e;
  }
};

export const isDevelop = () => process.env.NODE_ENV === "development";
export const isMobile = () =>
  // @ts-expect-error ts-migrate(2339) FIXME: Property 'sodium' does not exist on type 'Window &... Remove this comment to see the full error message
  window.sodium !== undefined && window.chrome.storage === undefined;
export const isExtension = () =>
  // @ts-expect-error ts-migrate(2339) FIXME: Property 'sodium' does not exist on type 'Window &... Remove this comment to see the full error message
  window.sodium === undefined && window.chrome.storage !== undefined;
export const isWeb = () =>
  // @ts-expect-error ts-migrate(2339) FIXME: Property 'sodium' does not exist on type 'Window &... Remove this comment to see the full error message
  window.sodium === undefined && window.chrome.storage === undefined;

export const sizeFormat = (bytes: any, exponent: any) => {
  const divider = 1024 ** exponent;
  // 整数部が4桁になったら少数部は省く
  const fraction = bytes >= divider * 1000 ? 0 : 2;
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: fraction,
    minimumFractionDigits: fraction,
  }).format(bytes / divider);
};

export const gigaSizeFormat = (bytes: any) => sizeFormat(bytes, 3);
export const megaSizeFormat = (bytes: any) => sizeFormat(bytes, 2);
