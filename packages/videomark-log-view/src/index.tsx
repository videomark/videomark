import React, { lazy, Suspense } from "react";
import ReactDOM from "react-dom";
import "./index.css";
// @ts-expect-error ts-migrate(7016) FIXME: Try `npm install @types/react-router-dom` if it ex... Remove this comment to see the full error message
import { HashRouter as Router, Switch, Route } from "react-router-dom";
import { isDevelop, isWeb } from "./js/utils/Utils";

// @ts-expect-error ts-migrate(6142) FIXME: Module './App' was resolved to '/home/kou029w/vide... Remove this comment to see the full error message
const App = lazy(() => import("./App"));
// @ts-expect-error ts-migrate(6142) FIXME: Module './StatsSummary' was resolved to '/home/kou... Remove this comment to see the full error message
const StatsSummary = lazy(() => import("./StatsSummary"));
// @ts-expect-error ts-migrate(6142) FIXME: Module './Import' was resolved to '/home/kou029w/v... Remove this comment to see the full error message
const Import = lazy(() => import("./Import"));
// @ts-expect-error ts-migrate(6142) FIXME: Module './Export' was resolved to '/home/kou029w/v... Remove this comment to see the full error message
const Export = lazy(() => import("./Export"));
// @ts-expect-error ts-migrate(6142) FIXME: Module './Migration' was resolved to '/home/kou029... Remove this comment to see the full error message
const Migration = lazy(() => import("./Migration"));
// @ts-expect-error ts-migrate(6142) FIXME: Module './Rollback' was resolved to '/home/kou029w... Remove this comment to see the full error message
const Rollback = lazy(() => import("./Rollback"));
// @ts-expect-error ts-migrate(6142) FIXME: Module './Settings' was resolved to '/home/kou029w... Remove this comment to see the full error message
const Settings = lazy(() => import("./Settings"));
// @ts-expect-error ts-migrate(6142) FIXME: Module './Popup' was resolved to '/home/kou029w/vi... Remove this comment to see the full error message
const Popup = lazy(() => import("./Popup"));

if (!isDevelop() && isWeb()) window.location.pathname = "unsupported.html";
else {
  ReactDOM.render(
    // @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
    <Router>
      {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
      <Suspense fallback={null}>
        {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
        <Switch>
          {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
          <Route exact path="/stats" component={StatsSummary} />
          {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
          <Route exact path="/import" component={Import} />
          {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
          <Route exact path="/export" component={Export} />
          {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
          <Route exact path="/migration" component={Migration} />
          {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
          <Route exact path="/rollback" component={Rollback} />
          {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
          <Route exact path="/settings" component={Settings} />
          {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
          <Route exact path="/popup" component={Popup} />
          {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
          <Route path="/" component={App} />
        </Switch>
      </Suspense>
    </Router>,
    document.getElementById("root")
  );
}
