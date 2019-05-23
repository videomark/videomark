import * as React from "react";
import Header from "./js/containers/Header";
import dataErase from "./js/utils/DataErase";
import Modal from "./js/components/Modal";
import style from "./App.module.css";
import ChromeExtensionWrapper from "./js/utils/ChromeExtensionWrapper";
import AppData from "./js/utils/AppData";
import AppDataActions from "./js/utils/AppDataActions";
import ViewingList from "./js/containers/ViewingList";
import OfflineNoticeSnackbar from "./js/components/OfflineNoticeSnackbar";

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
    await dataErase.initialize();
    // FIXME: ViewingListをrender()しないと表示が反映されない
    AppData.update(AppDataActions.ViewingList, state => state);
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
      <>
        <div className={style.qoe_log_view}>
          <Header />
          <ViewingList />
          <OfflineNoticeSnackbar />
        </div>
        <Modal
          className={modal.show ? style.modal_open : ""}
          closeCallback={() => {
            this.modalDataUpdateCallback(null);
          }}
        >
          {modal.show ? modal.contents : ""}
        </Modal>
      </>
    );
  }
}

export default App;
