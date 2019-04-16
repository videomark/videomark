import React, { Component } from "react";
import Viewing from "./Viewing";
import ChromeExtensionWrapper from "../utils/ChromeExtensionWrapper";

class ViewingList extends Component {
  constructor() {
    super();
    this.state = { viewings: [] };
  }

  async componentDidMount() {
    const viewings = await new Promise(resolve => {
      ChromeExtensionWrapper.loadVideoIds(resolve);
    });
    this.setState({
      viewings: viewings.map(({ id, data }) => ({
        key: id,
        sessionId: data.session_id,
        videoId: data.video_id
      }))
    });
  }

  render() {
    const { viewings } = this.state;
    return viewings.map(({ key, sessionId, videoId }) => (
      <Viewing key={key} sessionId={sessionId} videoId={videoId} />
    ));
  }
}
export default ViewingList;
