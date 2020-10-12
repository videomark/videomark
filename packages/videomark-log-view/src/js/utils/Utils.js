import React, { useState, useEffect } from "react";
import videoPlatforms from "./videoPlatforms";

export const urlToVideoPlatform = (url) => {
  try {
    const { host } = new URL(url);
    return videoPlatforms.find((platform) => platform.host.test(host)) || {};
  } catch (e) {
    if (e instanceof TypeError) return {};
    throw e;
  }
};

export const isDevelop = () => process.env.NODE_ENV === "development";
export const isVMBrowser = () =>
  window.sodium !== undefined && window.chrome.storage === undefined;
export const isExtension = () =>
  window.sodium === undefined && window.chrome.storage !== undefined;
export const isWeb = () =>
  window.sodium === undefined && window.chrome.storage === undefined;

export const sizeFormat = (bytes, exponent) => {
  const divider = 1024 ** exponent;
  // 整数部が4桁になったら少数部は省く
  const fraction = bytes >= divider * 1000 ? 0 : 2;
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: fraction,
    minimumFractionDigits: fraction,
  }).format(bytes / divider);
};

export const gigaSizeFormat = (bytes) => sizeFormat(bytes, 3);
export const megaSizeFormat = (bytes) => sizeFormat(bytes, 2);

// 必ず変数に確保してから使うこと。条件式に直接使ってはいけない
export const isMobile = () => {
  const [platformInfo, setPlatformInfo] = useState(false);

  useEffect(() => {
    if (window.sodium !== undefined) {
      setPlatformInfo({ os: "android" });
    } else {
      chrome.runtime.getPlatformInfo(info => setPlatformInfo(info))
    }
  });

  return isVMBrowser() || platformInfo.os === "android";
};
