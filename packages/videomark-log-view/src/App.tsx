import React, { lazy, Suspense } from "react";
// @ts-expect-error ts-migrate(7016) FIXME: Try `npm install @types/react-router-dom` if it ex... Remove this comment to see the full error message
import { Switch, Route } from "react-router-dom";
import Container from "@material-ui/core/Container";
import Box from "@material-ui/core/Box";
// @ts-expect-error ts-migrate(2307) FIXME: Cannot find module './App.module.css' or its corre... Remove this comment to see the full error message
import style from "./App.module.css";
// @ts-expect-error ts-migrate(6142) FIXME: Module './Migration' was resolved to '/home/kou029... Remove this comment to see the full error message
import { MigrationDialog } from "./Migration";
import ChromeExtensionWrapper from "./js/utils/ChromeExtensionWrapper";
import AppData from "./js/utils/AppData";
import AppDataActions from "./js/utils/AppDataActions";
// @ts-expect-error ts-migrate(6142) FIXME: Module './js/containers/ViewingsProvider' was reso... Remove this comment to see the full error message
import { ViewingsProvider } from "./js/containers/ViewingsProvider";
// @ts-expect-error ts-migrate(6142) FIXME: Module './js/containers/StatsDataProvider' was res... Remove this comment to see the full error message
import { StatsDataProvider } from "./js/containers/StatsDataProvider";
// @ts-expect-error ts-migrate(6142) FIXME: Module './js/components/OfflineNoticeSnackbar' was... Remove this comment to see the full error message
import OfflineNoticeSnackbar from "./js/components/OfflineNoticeSnackbar";
// @ts-expect-error ts-migrate(6142) FIXME: Module './js/components/ThemeProvider' was resolve... Remove this comment to see the full error message
import ThemeProvider from "./js/components/ThemeProvider";
// @ts-expect-error ts-migrate(6142) FIXME: Module './js/components/Modal' was resolved to '/h... Remove this comment to see the full error message
import Modal from "./js/components/Modal";
// @ts-expect-error ts-migrate(6142) FIXME: Module './js/containers/Header' was resolved to '/... Remove this comment to see the full error message
import Header from "./js/containers/Header";

// @ts-expect-error ts-migrate(6142) FIXME: Module './js/containers/Stats' was resolved to '/h... Remove this comment to see the full error message
const Stats = lazy(() => import("./js/containers/Stats"));
// @ts-expect-error ts-migrate(6142) FIXME: Module './js/containers/History' was resolved to '... Remove this comment to see the full error message
const History = lazy(() => import("./js/containers/History"));
// @ts-expect-error ts-migrate(6142) FIXME: Module './js/components/Welcome' was resolved to '... Remove this comment to see the full error message
const Welcome = lazy(() => import("./js/components/Welcome"));
// @ts-expect-error ts-migrate(6142) FIXME: Module './js/components/NotFound' was resolved to ... Remove this comment to see the full error message
const NotFound = lazy(() => import("./js/components/NotFound"));

type State = any;

class App extends React.Component<{}, State> {
  measureContentsData: any;
  constructor() {
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 1-2 arguments, but got 0.
    super();
    this.state = { setup: true, modal: { show: false, contents: null } };
    this.measureContentsData = null;
  }

  async componentDidMount() {
    const agreed = await new Promise((resolve) =>
      ChromeExtensionWrapper.loadAgreedTerm(resolve)
    );
    if (!agreed) {
      const url = new URL(window.location.href);
      url.pathname = "/terms.html";
      window.location.href = url.href;
      return;
    }
    AppData.add(AppDataActions.Modal, this, "modalDataUpdateCallback");
    this.setState({ setup: false });
  }

  modalDataUpdateCallback(data: any) {
    this.setState({
      modal: {
        show: data !== null,
        contents: data,
      },
    });
  }

  render() {
    const { setup, modal } = this.state;

    if (setup) return null;
    return (
      // @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
      <ViewingsProvider>
        {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
        <StatsDataProvider>
          {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
          <ThemeProvider>
            {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
            <MigrationDialog />
            {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
            <div className={style.qoe_log_view}>
              {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
              <Header />
              {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
              <Box paddingTop={6}>
                {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
                <Container>
                  {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
                  <Suspense fallback={null}>
                    {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
                    <Switch>
                      {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
                      <Route exact path="/" component={Stats} />
                      {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
                      <Route exact path="/history" component={History} />
                      {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
                      <Route exact path="/welcome" component={Welcome} />
                      {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
                      <Route component={NotFound} />
                    </Switch>
                  </Suspense>
                </Container>
              </Box>
              {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
              <OfflineNoticeSnackbar />
            </div>
            {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
            <Modal
              open={modal.show}
              closeCallback={() => {
                this.modalDataUpdateCallback(null);
              }}
            >
              {modal.show ? modal.contents : ""}
            </Modal>
          </ThemeProvider>
        </StatsDataProvider>
      </ViewingsProvider>
    );
  }
}

export default App;
