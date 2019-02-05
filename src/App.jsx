import * as React from "react";
import GridContainer from "./js/GridContainer";
import measureData from "./js/MeasureData";
import { createKey } from "./js/Utils";
import Header from "./js/Header/Header";
import dataErase from "./js/DataErase";
import Modal from "./js/Modal/Modal";
import "./App.css";
import ChromeExtensionWrapper from "./js/ChromeExtensionWrapper";
import appData from "./js/Data/AppData";
import AppDataActions from "./js/Data/AppDataActions";

class App extends React.Component {
  constructor() {
    super();
    this.state = { data: [], modal: { show: false, contents: null } };

    this.setup = false;
    measureData.initialize(data => {
      this.setState({ data });
    });

    this.measureContentsData = null;
  }

  async componentDidMount() {
    await dataErase.initialize();
    appData.add(AppDataActions.Modal, this, "modalDataUpdateCallback");

    ChromeExtensionWrapper.loadAgreedTerm(value => {
      this.setup = true;
      measureData.update();
      if (!value) {
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
    const { data, modal } = this.state;
    return (
      this.setup && (
        <div className="App">
          <div>
            <div className="qoe-log-view">
              <Header />
              <GridContainer key={createKey()} contentsData={data} />
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
      )
    );
  }
}

export default App;
