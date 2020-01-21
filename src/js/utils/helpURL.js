import { isMobile, isExtension } from "./Utils";

const helpURL = (base => {
  if (isMobile()) return new URL("android", base);
  if (isExtension()) return new URL("extension", base);
  return base;
})(new URL("https://vm.webdino.org/help/"));

export default helpURL;
