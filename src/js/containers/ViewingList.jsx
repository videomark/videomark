import React, { Component } from "react";
import Viewing from "./Viewing";
import ChromeExtensionWrapper from "../utils/ChromeExtensionWrapper";
import AppData from "../utils/AppData";
import AppDataActions from "../utils/AppDataActions";
import { Services, LocationToService } from "../utils/Utils";

class ViewingList extends Component {
  constructor() {
    super();
    this.state = {
      viewings: [],
      sites: Object.values(Services),
      date: new Date()
    };
  }

  async componentDidMount() {
    const viewings = await new Promise(resolve => {
      ChromeExtensionWrapper.loadVideoIds(resolve);
    });
    this.setState({
      viewings: viewings
        .map(({ id, data }) => ({
          key: id,
          sessionId: data.session_id,
          videoId: data.video_id,
          location: data.location,
          startTime: new Date(data.start_time)
        }))
        .sort((a, b) => a.startTime - b.startTime)
    });
    AppData.add(AppDataActions.ViewingList, this, "setState");
  }

  render() {
    const { viewings, sites, date } = this.state;
    return viewings
      .filter(({ location }) => sites.includes(LocationToService(location)))
      .filter(
        ({ startTime }) =>
          startTime.getFullYear() === date.getFullYear() &&
          startTime.getMonth() === date.getMonth()
      )
      .map(({ key, sessionId, videoId }) => (
        <Viewing key={key} sessionId={sessionId} videoId={videoId} />
      ));
  }
}
export default ViewingList;
