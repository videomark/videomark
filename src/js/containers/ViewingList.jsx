import React, { Component } from "react";
import Viewing from "./Viewing";
import ChromeExtensionWrapper from "../utils/ChromeExtensionWrapper";
import AppData from "../utils/AppData";
import AppDataActions from "../utils/AppDataActions";
import { Services, LocationToService } from "../utils/Utils";
import RegionalAverageQoE from "../utils/RegionalAverageQoE";
import HourlyAverageQoE from "../utils/HourlyAverageQoE";

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
    const regions = viewings
      .map(({ data }) => {
        const { country, subdivision } = data.region || {};
        return { country, subdivision };
      })
      .filter(
        (region, i, self) =>
          i ===
          self.findIndex(
            r =>
              r.country === region.country &&
              r.subdivision === region.subdivision
          )
      );
    const regionalAverageQoE = new RegionalAverageQoE(regions);
    await regionalAverageQoE.init();
    this.setState({ regionalAverageQoE });
    const hourlyAverageQoE = new HourlyAverageQoE();
    await hourlyAverageQoE.init();
    this.setState({ hourlyAverageQoE });
    AppData.add(AppDataActions.ViewingList, this, "setState");
  }

  render() {
    const {
      viewings,
      sites,
      date,
      regionalAverageQoE,
      hourlyAverageQoE
    } = this.state;

    return viewings
      .filter(({ location }) => sites.includes(LocationToService(location)))
      .filter(
        ({ startTime }) =>
          startTime.getFullYear() === date.getFullYear() &&
          startTime.getMonth() === date.getMonth()
      )
      .map(({ key, sessionId, videoId }) => (
        <Viewing
          key={key}
          sessionId={sessionId}
          videoId={videoId}
          regionalAverageQoE={regionalAverageQoE}
          hourlyAverageQoE={hourlyAverageQoE}
        />
      ));
  }
}
export default ViewingList;
