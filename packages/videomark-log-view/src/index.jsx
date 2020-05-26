import React, { lazy, Suspense } from "react";
import ReactDOM from "react-dom";
import "./index.css";
import { HashRouter as Router, Switch, Route } from "react-router-dom";
import { isDevelop, isWeb } from "./js/utils/Utils";

const App = lazy(() => import("./App"));
const StatsSummary = lazy(() => import("./StatsSummary"));
const Import = lazy(() => import("./Import"));
const Export = lazy(() => import("./Export"));
const Migration = lazy(() => import("./Migration"));
const Rollback = lazy(() => import("./Rollback"));
const Settings = lazy(() => import("./Settings"));
const Popup = lazy(() => import("./Popup"));

if (!isDevelop() && isWeb()) window.location.pathname = "unsupported.html";
else {
  ReactDOM.render(
    <Router>
      <Suspense fallback={null}>
        <Switch>
          <Route exact path="/stats" component={StatsSummary} />
          <Route exact path="/import" component={Import} />
          <Route exact path="/export" component={Export} />
          <Route exact path="/migration" component={Migration} />
          <Route exact path="/rollback" component={Rollback} />
          <Route exact path="/settings" component={Settings} />
          <Route exact path="/popup" component={Popup} />
          <Route path="/" component={App} />
        </Switch>
      </Suspense>
    </Router>,
    document.getElementById("root")
  );
}
