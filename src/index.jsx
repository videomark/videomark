import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import * as serviceWorker from "./serviceWorker";
import ChromeExtensionWrapper from "./js/utils/ChromeExtensionWrapper";

if (!ChromeExtensionWrapper.canUseVideoMarkApi()) {
  window.location.pathname = "unsupported.html";
} else {
  ReactDOM.render(<App />, document.getElementById("root"));
  serviceWorker.unregister();
}
