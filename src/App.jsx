import * as React from "react";
import Header from "./js/containers/Header";
import dataErase from "./js/utils/DataErase";
import Modal from "./js/components/Modal";
import "./App.css";
import ChromeExtensionWrapper from "./js/utils/ChromeExtensionWrapper";
import appData from "./js/utils/AppData";
import AppDataActions from "./js/utils/AppDataActions";
import ViewingList from "./js/containers/ViewingList";

class App extends React.Component {
  constructor() {
    super();
    this.state = { modal: { show: false, contents: null } };
    this.setup = false;
    this.measureContentsData = null;
  }

  async componentDidMount() {
    await dataErase.initialize();
    appData.add(AppDataActions.Modal, this, "modalDataUpdateCallback");

    ChromeExtensionWrapper.loadAgreedTerm(value => {
      if (!value) {
        this.setup = true;
        const url = new URL(window.location.href);
        url.pathname = "/terms.html";
        window.location.href = url.href;
      }
    });
  }

  modalDataUpdateCallback(data) {
    this.setState(prevState => {
      const state = prevState;
      state.modal.show = data !== null;
      state.modal.contents = data;
      return state;
    });
  }

  render() {
    const { modal } = this.state;
    if (this.setup) return null;
    return (
      <div className="App">
        <div>
          <div className="qoe-log-view">
            <Header />
            <ViewingList />
          </div>
          <Modal
            className={modal.show ? "modal-open" : ""}
            closeCallback={() => {
              this.modalDataUpdateCallback(null);
            }}
          >
            {modal.show ? modal.contents : ""}
          </Modal>
        </div>
      </div>
    );
  }
}

export default App;
