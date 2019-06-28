import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import { HashRouter as Router, Switch, Route } from "react-router-dom";
import App from "./App";
import StatsSummary from "./StatsSummary";
import * as serviceWorker from "./serviceWorker";
import ChromeExtensionWrapper from "./js/utils/ChromeExtensionWrapper";

if (!ChromeExtensionWrapper.canUseVideoMarkApi()) {
  window.location.pathname = "unsupported.html";
} else {
  ReactDOM.render(
    <Router>
      <Switch>
        <Route exact path="/stats" component={StatsSummary} />
        <Route path="/" component={App} />
      </Switch>
    </Router>,
    document.getElementById("root")
  );
  serviceWorker.unregister();
}
