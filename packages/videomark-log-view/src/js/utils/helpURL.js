import { isVMBrowser, isExtension } from "./Utils";

const helpURL = ((base) => {
  if (isVMBrowser()) return new URL("android", base);
  if (isExtension()) return new URL("extension", base);
  return base;
})(new URL("https://videomark.webdino.org/help/"));

export default helpURL;
