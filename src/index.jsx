import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import { HashRouter as Router, Switch, Route } from "react-router-dom";
import fromEntries from "object.fromentries";
import App from "./App";
import StatsSummary from "./StatsSummary";
import Import from "./Import";
import Export from "./Export";
import * as serviceWorker from "./serviceWorker";

// FIXME: for chrome version < 73
if (!Object.fromEntries) fromEntries.shim();

ReactDOM.render(
  <Router>
    <Switch>
      <Route exact path="/stats" component={StatsSummary} />
      <Route exact path="/import" component={Import} />
      <Route exact path="/export" component={Export} />
      <Route path="/" component={App} />
    </Switch>
  </Router>,
  document.getElementById("root")
);
serviceWorker.unregister();
