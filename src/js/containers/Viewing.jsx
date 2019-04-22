import React, { Component } from "react";
import PropTypes from "prop-types";
import Button from "@material-ui/core/Button";
import ViewingModel from "../utils/Viewing";
import QoEValueGraphList from "../components/QoEValueGraphList";
import style from "../../css/MeasureContents.module.css";
import { urlToVideoPlatform } from "../utils/Utils";
import RegionalAverageQoE from "../utils/RegionalAverageQoE";
import HourlyAverageQoE from "../utils/HourlyAverageQoE";
import { CrossIcon, Refresh } from "../components/Icons";
import DataErase from "../utils/DataErase";
import AppData from "../utils/AppData";
import AppDataActions from "../utils/AppDataActions";
import NoImage from "../../images/noimage.svg";

const toTimeString = date => {
  return `${date.getFullYear()}/${date.getMonth() +
    1}/${`0${date.getDate()}`.slice(
    -2
  )} ${date.getHours()}:${`0${date.getMinutes()}`.slice(-2)}`;
};

class Viewing extends Component {
  constructor(props) {
    super(props);
    const { sessionId, videoId, disabled } = props;
    this.viewing = new ViewingModel({ sessionId, videoId });
    this.state = {
      title: "",
      location: "#",
      thumbnail: "",
      startTime: new Date(),
      qoe: 0,
      disabled
    };
  }

  async componentDidMount() {
    const { viewing } = this;
    const id = await viewing.init();
    this.setState({
      id,
      title: await viewing.title,
      location: await viewing.location,
      thumbnail: await viewing.thumbnail,
      startTime: await viewing.startTime,
      qoe: await viewing.qoe
    });
    const { regionalAverageQoE } = this.props;
    const region = (await viewing.region) || {};
    this.setState({
      region,
      regionalAverageQoE: await regionalAverageQoE.at(region)
    });
    const { hourlyAverageQoE } = this.props;
    const startTime = await viewing.startTime;
    const hour = startTime.getHours();
    this.setState({
      hour,
      hourlyAverageQoE: await hourlyAverageQoE.at(hour)
    });
  }

  render() {
    const {
      id,
      title,
      location,
      thumbnail,
      startTime,
      qoe,
      region,
      regionalAverageQoE,
      hour,
      hourlyAverageQoE,
      disabled
    } = this.state;

    const graphList = (
      <>
        <div style={{ width: "100%", height: "20px" }} />
        <QoEValueGraphList
          value={qoe}
          region={region}
          regionalAverage={regionalAverageQoE}
          hour={hour}
          hourlyAverage={hourlyAverageQoE}
        />
      </>
    );

    const recoverOrRemoveButton = (
      <div className={style.removedStateButtons}>
        <Button
          variant="contained"
          color="primary"
          className={style.removedStateButton}
          onClick={() => {
            DataErase.recover(id);
            // FIXME: ViewingListをrender()しないと表示が変わらない
            AppData.update(AppDataActions.ViewingList, state => state);
          }}
        >
          <Refresh />
          <span>&nbsp;復元</span>
        </Button>
        <Button
          variant="contained"
          color="secondary"
          className={style.removedStateButton}
          onClick={async () => {
            await DataErase.remove(id);
            AppData.update(AppDataActions.ViewingList, state =>
              Object.assign(state, {
                viewings: state.viewings.filter(viewing =>
                  DataErase.contains(viewing.id)
                )
              })
            );
          }}
        >
          <CrossIcon />
          <span>&nbsp;削除</span>
        </Button>
      </div>
    );
    const disabledInfo = (
      <>
        <div className={style.removedStateInfoText}>
          次回起動時に削除します。復元を押すと削除を取り消し、削除ボタンを押すと今すぐ削除します。
        </div>
        {recoverOrRemoveButton}
      </>
    );

    return (
      <div className={style.main}>
        <div className={style.header}>
          <img
            className={
              style.thumbnail + (disabled ? ` ${style.removedThumbnail}` : "")
            }
            src={thumbnail}
            alt={title}
            onError={e => {
              e.target.src = NoImage;
            }}
          />
          <div className={style.movieInfo}>
            <span className={style.serviceName}>
              {urlToVideoPlatform(location).name}
            </span>
            <span className={style.startTime}>{toTimeString(startTime)}</span>
          </div>
        </div>
        <div className={style.title}>{title}</div>
        {disabled ? disabledInfo : graphList}
      </div>
    );
  }
}

Viewing.propTypes = {
  sessionId: PropTypes.string.isRequired,
  videoId: PropTypes.string.isRequired,
  regionalAverageQoE: PropTypes.instanceOf(RegionalAverageQoE),
  hourlyAverageQoE: PropTypes.instanceOf(HourlyAverageQoE),
  disabled: PropTypes.bool
};

Viewing.defaultProps = {
  regionalAverageQoE: new RegionalAverageQoE(),
  hourlyAverageQoE: new HourlyAverageQoE(),
  disabled: false
};

export default Viewing;
