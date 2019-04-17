import React, { Component } from "react";
import PropTypes from "prop-types";
import ViewingModel from "../utils/Viewing";
import QoEValueGraph from "../components/QoEValueGraph";
import style from "../../css/MeasureContents.module.css";
import { LocationToService } from "../utils/Utils";
import RegionalAverageQoE from "../utils/RegionalAverageQoE";
import HourlyAverageQoE from "../utils/HourlyAverageQoE";

const toTimeString = date => {
  return `${date.getFullYear()}/${date.getMonth() +
    1}/${`0${date.getDate()}`.slice(
    -2
  )} ${date.getHours()}:${`0${date.getMinutes()}`.slice(-2)}`;
};

class Viewing extends Component {
  constructor(props) {
    super(props);
    const { sessionId, videoId } = props;
    this.viewing = new ViewingModel({ sessionId, videoId });
    this.state = {
      title: "",
      location: "",
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
      location: LocationToService(await viewing.location),
      thumbnail: await viewing.thumbnail,
      startTime: await viewing.startTime,
      qoe: await viewing.qoe
    });
    const { regionalAverageQoE } = this.props;
    const region = (await viewing.region) || {};
    this.setState({
      regionalAverageQoE: await regionalAverageQoE.at(region)
    });
    const { hourlyAverageQoE } = this.props;
    const startTime = await viewing.startTime;
    this.setState({
      hourlyAverageQoE: await hourlyAverageQoE.at(startTime.getHours())
    });
  }

  render() {
    const {
      title,
      location,
      thumbnail,
      startTime,
      qoe,
      regionalAverageQoE,
      hourlyAverageQoE
    } = this.state;

    return (
      <div className={style.main}>
        <div className={style.header}>
          <img className={style.thumbnail} src={thumbnail} alt={title} />
          <div className={style.movieInfo}>
            <span className={style.serviceName}>{location}</span>
            <span className={style.startTime}>{toTimeString(startTime)}</span>
          </div>
        </div>
        <div className={style.title}>{title}</div>
        <div style={{ width: "100%", height: "20px" }} />
        <div className={style.qoeDate}>
          <div className={style.userGraph}>
            <div className={style.graph}>
              <QoEValueGraph label="QoE" qoe={qoe.toString()} />
            </div>
          </div>
          <div className={style.expanded}>
            <div className={style.graph}>
              {regionalAverageQoE !== undefined && (
                <QoEValueGraph
                  label="Regional"
                  qoe={regionalAverageQoE.toString()}
                />
              )}
              {hourlyAverageQoE !== undefined && (
                <QoEValueGraph
                  label="Hourly"
                  qoe={hourlyAverageQoE.toString()}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

Viewing.propTypes = {
  sessionId: PropTypes.string.isRequired,
  videoId: PropTypes.string.isRequired,
  regionalAverageQoE: PropTypes.instanceOf(RegionalAverageQoE).isRequired,
  hourlyAverageQoE: PropTypes.instanceOf(HourlyAverageQoE).isRequired
};

export default Viewing;
