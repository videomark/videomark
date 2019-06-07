import React, { Component } from "react";
import PropTypes from "prop-types";
import Button from "@material-ui/core/Button";
import Card from "@material-ui/core/Card";
import CardMedia from "@material-ui/core/CardMedia";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
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

    const VideoThumbnail = () => (
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
    );

    const GraphList = () => (
      <Grid container style={{ height: 76 }} alignItems="center">
        <Grid item xs style={{ paddingLeft: 4, paddingRight: 4 }}>
          <QoEValueGraphList
            value={qoe}
            region={region}
            regionalAverage={regionalAverageQoE}
            hour={hour}
            hourlyAverage={hourlyAverageQoE}
          />
        </Grid>
      </Grid>
    );

    const RecoverOrRemoveButton = () => (
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
                viewings: state.viewings.filter(viewing => viewing.id !== id)
              })
            );
          }}
        >
          <CrossIcon />
          <span>&nbsp;削除</span>
        </Button>
      </div>
    );
    const DisabledInfo = () => (
      <Grid
        container
        style={{ height: 76 }}
        direction="column"
        justify="flex-end"
      >
        <Grid item>
          <Typography
            component="small"
            variant="caption"
            color="error"
            align="center"
            gutterBottom
          >
            次回起動時に削除します。取り消すには復元、今すぐ削除するには削除を押してください。
          </Typography>
          <RecoverOrRemoveButton />
        </Grid>
      </Grid>
    );

    return (
      <Card>
        <div className={style.header}>
          <CardMedia component={VideoThumbnail} image="#" />
          <div className={style.movieInfo}>
            <span>{urlToVideoPlatform(location).name}</span>
            <span>{toTimeString(startTime)}</span>
          </div>
        </div>
        <div className={style.title}>{title}</div>
        {disabled ? <DisabledInfo /> : <GraphList />}
      </Card>
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
