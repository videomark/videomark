import React, { lazy, Suspense } from "react";
import { Switch, Route } from "react-router-dom";
import Container from "@material-ui/core/Container";
import Box from "@material-ui/core/Box";
import style from "./App.module.css";
import { MigrationDialog } from "./Migration";
import ChromeExtensionWrapper from "./js/utils/ChromeExtensionWrapper";
import AppData from "./js/utils/AppData";
import AppDataActions from "./js/utils/AppDataActions";
import { ViewingsProvider } from "./js/containers/ViewingsProvider";
import { StatsDataProvider } from "./js/containers/StatsDataProvider";
import OfflineNoticeSnackbar from "./js/components/OfflineNoticeSnackbar";
import ThemeProvider from "./js/components/ThemeProvider";
import Modal from "./js/components/Modal";
import Header from "./js/containers/Header";

const Stats = lazy(() => import("./js/containers/Stats"));
const History = lazy(() => import("./js/containers/History"));
const Welcome = lazy(() => import("./js/components/Welcome"));
const NotFound = lazy(() => import("./js/components/NotFound"));

class App extends React.Component {
  constructor() {
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

  modalDataUpdateCallback(data) {
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
      <ViewingsProvider>
        <StatsDataProvider>
          <ThemeProvider>
            <MigrationDialog />
            <div className={style.qoe_log_view}>
              <Header />
              <Box paddingTop={6}>
                <Container>
                  <Suspense fallback={null}>
                    <Switch>
                      <Route exact path="/" component={Stats} />
                      <Route exact path="/history" component={History} />
                      <Route exact path="/welcome" component={Welcome} />
                      <Route component={NotFound} />
                    </Switch>
                  </Suspense>
                </Container>
              </Box>
              <OfflineNoticeSnackbar />
            </div>
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
