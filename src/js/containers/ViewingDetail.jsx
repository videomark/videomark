import PropTypes from "prop-types";
import React, { Component } from "react";
import Button from "@material-ui/core/Button";
import QoEValueGraphList from "../components/QoEValueGraphList";
import DataErase from "../utils/DataErase";
import AppDataActions from "../utils/AppDataActions";
import AppData from "../utils/AppData";
import { urlToVideoPlatform } from "../utils/Utils";
import style from "../../css/MeasureContents.module.css";
import ViewingModel from "../utils/Viewing";
import RegionalAverageQoE from "../utils/RegionalAverageQoE";
import HourlyAverageQoE from "../utils/HourlyAverageQoE";

const toTimeString = date => {
  return `${date.getFullYear()}/${date.getMonth() +
    1}/${`0${date.getDate()}`.slice(
    -2
  )} ${date.getHours()}:${`0${date.getMinutes()}`.slice(-2)}`;
};

class ViewingDetail extends Component {
  constructor(props) {
    super(props);
    const { sessionId, videoId } = props;
    this.viewing = new ViewingModel({ sessionId, videoId });
    this.state = {
      id: this.viewing.viewingId,
      title: "",
      location: "#",
      thumbnail: "",
      startTime: new Date(),
      qoe: 0
    };
  }

  async componentDidMount() {
    const { viewing } = this;
    await viewing.init();
    this.setState({
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
      hourlyAverageQoE
    } = this.state;

    return (
      <div className={`${style.main} ${style.modalMain}`}>
        <div className={style.header}>
          <a href={location}>
            <img
              className={`${style.thumbnail} ${style.modalThumbnail}`}
              src={thumbnail}
              alt={title}
            />
          </a>
          <div className={style.movieInfo}>
            <span className={style.serviceName}>
              {urlToVideoPlatform(location).name}
            </span>
            <span className={style.startTime}>{toTimeString(startTime)}</span>
          </div>
        </div>
        <div className={`${style.title} ${style.modalTitle}`}>{title}</div>
        <div style={{ width: "100%", height: "20px" }} />
        <QoEValueGraphList
          value={qoe}
          region={region}
          regionalAverage={regionalAverageQoE}
          hour={hour}
          hourlyAverage={hourlyAverageQoE}
          isDetail
        />
        <Button
          color="secondary"
          className={style.eraseButton}
          onClick={() => {
            DataErase.add(id);
            // FIXME: ViewingListをrender()しないと表示が変わらない
            AppData.update(AppDataActions.ViewingList, state => state);
            AppData.update(AppDataActions.Modal, null);
          }}
        >
          この計測結果を削除する
        </Button>
      </div>
    );
  }
}

ViewingDetail.propTypes = {
  sessionId: PropTypes.string.isRequired,
  videoId: PropTypes.string.isRequired,
  regionalAverageQoE: PropTypes.instanceOf(RegionalAverageQoE).isRequired,
  hourlyAverageQoE: PropTypes.instanceOf(HourlyAverageQoE).isRequired
};
export default ViewingDetail;
