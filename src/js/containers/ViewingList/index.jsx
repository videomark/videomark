import React, { Component } from "react";
import Grid from "@material-ui/core/Grid";
import Viewing from "../Viewing";
import ChromeExtensionWrapper from "../../utils/ChromeExtensionWrapper";
import AppData from "../../utils/AppData";
import AppDataActions from "../../utils/AppDataActions";
import { urlToVideoPlatform } from "../../utils/Utils";
import RegionalAverageQoE from "../../utils/RegionalAverageQoE";
import HourlyAverageQoE from "../../utils/HourlyAverageQoE";
import style from "../../../css/GridContainer.module.css";
import ViewingDetail from "../ViewingDetail";
import DataErase from "../../utils/DataErase";
import NoContents from "../../components/NoContents";
import videoPlatforms from "../../utils/videoPlatforms.json";
import Pager from "./Pager";

class ViewingList extends Component {
  constructor() {
    super();
    this.state = {
      viewings: [],
      sites: videoPlatforms.map(({ id }) => id),
      date: new Date(),
      page: 0,
      perPage: 60
    };
  }

  async componentDidMount() {
    const viewings = await new Promise(resolve => {
      ChromeExtensionWrapper.loadVideoIds(resolve);
    });
    this.setState({
      viewings: viewings
        .map(({ id, data }) => ({
          id,
          sessionId: data.session_id,
          videoId: data.video_id,
          location: data.location,
          startTime: new Date(data.start_time)
        }))
        .sort((a, b) => b.startTime - a.startTime)
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
      hourlyAverageQoE,
      page,
      perPage
    } = this.state;

    if (viewings.length === 0) {
      return (
        <div className={style.gridContainer}>
          <Grid>
            <NoContents title="まだ計測対象となる動画を視聴していません" />
          </Grid>
        </div>
      );
    }

    const viewingList = viewings
      .filter(({ location }) => sites.includes(urlToVideoPlatform(location).id))
      .filter(
        ({ startTime }) =>
          startTime.getFullYear() === date.getFullYear() &&
          startTime.getMonth() === date.getMonth()
      )
      .map(viewing =>
        Object.assign(viewing, {
          disabled: DataErase.contains(viewing.id)
        })
      )
      .map(({ id, sessionId, videoId, disabled }) => (
        <div
          key={id + (disabled ? "_disabled" : "")}
          className={`${style.content}`}
          role="button"
          onClick={() => {
            if (disabled) return;
            AppData.update(
              AppDataActions.Modal,
              <ViewingDetail
                key={id}
                sessionId={sessionId}
                videoId={videoId}
                regionalAverageQoE={regionalAverageQoE}
                hourlyAverageQoE={hourlyAverageQoE}
              />
            );
          }}
          onKeyPress={this.handleKeyPress}
          tabIndex="0"
        >
          <Viewing
            key={id + (disabled ? "_disabled" : "")}
            sessionId={sessionId}
            videoId={videoId}
            regionalAverageQoE={regionalAverageQoE}
            hourlyAverageQoE={hourlyAverageQoE}
            disabled={disabled}
          />
        </div>
      ));

    if (viewingList.length === 0) {
      return (
        <div className={style.gridContainer}>
          <Grid>
            <NoContents />
          </Grid>
        </div>
      );
    }

    const maxPage = Math.ceil(viewingList.length / perPage);

    return (
      <div className={style.gridContainer}>
        <Grid
          container
          spacing={24}
          direction="row"
          alignItems="flex-start"
          id={style.con}
          className={style.grid}
        >
          {viewingList.slice(page * perPage, (page + 1) * perPage)}
        </Grid>
        {maxPage <= 1 ? null : <Pager page={page} maxPage={maxPage} />}
      </div>
    );
  }
}
export default ViewingList;
