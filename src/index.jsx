import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import { HashRouter as Router, Switch, Route } from "react-router-dom";
import App from "./App";
import StatsSummary from "./StatsSummary";
import Import from "./Import";
import Export from "./Export";
import Migration from "./Migration";
import { isDevelop, isWeb } from "./js/utils/Utils";

if (!isDevelop() && isWeb()) window.location.pathname = "unsupported.html";
else {
  ReactDOM.render(
    <Router>
      <Switch>
        <Route exact path="/stats" component={StatsSummary} />
        <Route exact path="/import" component={Import} />
        <Route exact path="/export" component={Export} />
        <Route exact path="/migration" component={Migration} />
        <Route path="/" component={App} />
      </Switch>
    </Router>,
    document.getElementById("root")
  );
}
