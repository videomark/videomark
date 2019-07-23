import * as React from "react";
import { Switch, Route } from "react-router-dom";
import { createMuiTheme } from "@material-ui/core/styles";
import { ThemeProvider } from "@material-ui/styles";
import CssBaseline from "@material-ui/core/CssBaseline";
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
import Modal from "./js/components/Modal";
import Header from "./js/containers/Header";
import Stats from "./js/containers/Stats";
import History from "./js/containers/History";
import Welcome from "./js/components/Welcome";
import NotFound from "./js/components/NotFound";

const theme = createMuiTheme({
  palette: {
    primary: { main: "#1c2d69" },
    secondary: { main: "#d1101b" }
  }
});

class App extends React.Component {
  constructor() {
    super();
    this.state = { setup: true, modal: { show: false, contents: null } };
    this.measureContentsData = null;
  }

  async componentDidMount() {
    const agreed = await new Promise(resolve =>
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
        contents: data
      }
    });
  }

  render() {
    const { setup, modal } = this.state;

    if (setup) return null;
    return (
      <ViewingsProvider>
        <StatsDataProvider>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <MigrationDialog />
            <div className={style.qoe_log_view}>
              <Header />
              <Box paddingTop={6}>
                <Container>
                  <Switch>
                    <Route exact path="/" component={Stats} />
                    <Route exact path="/history" component={History} />
                    <Route exact path="/welcome" component={Welcome} />
                    <Route component={NotFound} />
                  </Switch>
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
