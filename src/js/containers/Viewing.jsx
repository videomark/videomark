import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import Button from "@material-ui/core/Button";
import Card from "@material-ui/core/Card";
import CardMedia from "@material-ui/core/CardMedia";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import { isLowQuality } from "../components/VideoQuality";
import QoEValueGraphList from "../components/QoEValueGraphList";
import style from "../../css/MeasureContents.module.css";
import { urlToVideoPlatform } from "../utils/Utils";
import ViewingModel from "../utils/Viewing";
import RegionalAverageQoE from "../utils/RegionalAverageQoE";
import HourlyAverageQoE from "../utils/HourlyAverageQoE";
import { CrossIcon, Refresh } from "../components/Icons";
import DataErase from "../utils/DataErase";
import AppData from "../utils/AppData";
import AppDataActions from "../utils/AppDataActions";
import NoImage from "../../images/noimage.svg";

export const VideoThumbnail = ({ className, title, thumbnail }) => (
  <img
    className={className}
    src={thumbnail}
    alt={title}
    onError={e => {
      e.target.src = NoImage;
    }}
  />
);
VideoThumbnail.propTypes = {
  className: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  thumbnail: PropTypes.string.isRequired
};

export const toTimeString = date => {
  return `${date.getFullYear()}/${date.getMonth() +
    1}/${`0${date.getDate()}`.slice(
    -2
  )} ${date.getHours()}:${`0${date.getMinutes()}`.slice(-2)}`;
};

export const fetch = async ({ model, regionalStats, hourlyStats }) => {
  await model.init();
  const title = await model.title;
  const location = await model.location;
  const thumbnail = await model.thumbnail;
  const startTime = await model.startTime;
  const qoe = await model.qoe;
  const quality = await model.quality;
  const region = (await model.region) || {};
  const regionalAverage = await regionalStats.at(region);
  const hourlyAverage = await hourlyStats.at(startTime.getHours());
  return {
    title,
    location,
    thumbnail,
    startTime,
    qoe,
    quality,
    region,
    regionalAverage,
    hourlyAverage
  };
};

const Viewing = ({
  model,
  regionalAverageQoE: regionalStats,
  hourlyAverageQoE: hourlyStats,
  disabled
}) => {
  const [viewing, setViewing] = useState();
  useEffect(() => {
    (async () => {
      setViewing(await fetch({ model, regionalStats, hourlyStats }));
    })();
  }, [setViewing]);
  if (!viewing) return null;
  const {
    title,
    location,
    thumbnail,
    startTime,
    qoe,
    quality,
    region,
    regionalAverage,
    hourlyAverage
  } = viewing;

  const GraphList = () => (
    <Grid container style={{ height: 76 }} alignItems="center">
      <Grid item xs style={{ paddingLeft: 4, paddingRight: 4 }}>
        <QoEValueGraphList
          value={qoe}
          region={region}
          regionalAverage={regionalAverage}
          hour={startTime.getHours()}
          hourlyAverage={hourlyAverage}
          color={isLowQuality(quality) ? "text.secondary" : "default"}
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
          DataErase.recover(model.id);
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
          await DataErase.remove(model.id);
          AppData.update(AppDataActions.ViewingList, state =>
            Object.assign(state, {
              removed: [...state.removed, model.id]
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
          display="block"
          gutterBottom
          style={{ lineHeight: 1.2 }}
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
        <CardMedia
          component={() => (
            <VideoThumbnail
              className={
                style.thumbnail + (disabled ? ` ${style.removedThumbnail}` : "")
              }
              title={title}
              thumbnail={thumbnail}
            />
          )}
          image="#"
        />
        <div className={style.movieInfo}>
          <span>{urlToVideoPlatform(location).name}</span>
          <span>{toTimeString(startTime)}</span>
        </div>
      </div>
      <div className={style.title}>{title}</div>
      {disabled ? <DisabledInfo /> : <GraphList />}
    </Card>
  );
};
Viewing.propTypes = {
  model: PropTypes.instanceOf(ViewingModel).isRequired,
  regionalAverageQoE: PropTypes.instanceOf(RegionalAverageQoE).isRequired,
  hourlyAverageQoE: PropTypes.instanceOf(HourlyAverageQoE).isRequired,
  disabled: PropTypes.bool
};
Viewing.defaultProps = {
  disabled: false
};
export default React.memo(Viewing);
