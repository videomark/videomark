import PropTypes from "prop-types";
import React, { useState, useEffect, useCallback } from "react";
import Button from "@material-ui/core/Button";
import Grid from "@material-ui/core/Grid";
import Box from "@material-ui/core/Box";
import Typography from "@material-ui/core/Typography";
import QoEValueGraphList from "../components/QoEValueGraphList";
import { VideoQuality, isLowQuality } from "../components/VideoQuality";
import DataErase from "../utils/DataErase";
import AppDataActions from "../utils/AppDataActions";
import AppData from "../utils/AppData";
import { urlToVideoPlatform } from "../utils/Utils";
import style from "../../css/MeasureContents.module.css";
import ViewingModel from "../utils/Viewing";
import RegionalAverageQoE from "../utils/RegionalAverageQoE";
import HourlyAverageQoE from "../utils/HourlyAverageQoE";
import { VideoThumbnail, toTimeString, useViewing } from "./Viewing";

const VideoLinkWithThumbnail = ({ location, title, thumbnail }) => (
  <a href={location} target="_blank" rel="noopener noreferrer">
    <VideoThumbnail
      className={style.modalThumbnail}
      title={title}
      thumbnail={thumbnail}
    />
  </a>
);
VideoLinkWithThumbnail.propTypes = {
  location: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  thumbnail: PropTypes.string,
};
VideoLinkWithThumbnail.defaultProps = {
  thumbnail: null,
};

const VideoInfo = ({ location, startTime }) => (
  <div className={style.movieInfo}>
    <span>{urlToVideoPlatform(location).name}</span>
    <span>{toTimeString(startTime)}</span>
  </div>
);
VideoInfo.propTypes = {
  location: PropTypes.string.isRequired,
  startTime: PropTypes.instanceOf(Date).isRequired,
};

const QoE = ({ model, regionalStats, hourlyStats }) => {
  const viewing = useViewing(model);
  const [state, dispatch] = useState();
  useEffect(() => {
    if (viewing == null) return;

    (async () => {
      const qoe = await viewing.qoe;
      const hourlyAverage = await hourlyStats.at(viewing.startTime.getHours());
      const region = await viewing.region;
      const regionalAverage =
        region == null ? null : await regionalStats.at(region);
      dispatch({ qoe, hourlyAverage, region, regionalAverage });
    })();
  }, [viewing, dispatch]);

  if (viewing == null) return null;
  const { startTime, quality } = viewing;

  if (state == null) return null;
  const { qoe, region, hourlyAverage, regionalAverage } = state;

  return (
    <QoEValueGraphList
      value={qoe}
      region={region}
      regionalAverage={regionalAverage}
      hour={startTime.getHours()}
      hourlyAverage={hourlyAverage}
      isLowQuality={isLowQuality(quality)}
    />
  );
};
QoE.propTypes = {
  model: PropTypes.instanceOf(ViewingModel).isRequired,
  regionalStats: PropTypes.instanceOf(RegionalAverageQoE).isRequired,
  hourlyStats: PropTypes.instanceOf(HourlyAverageQoE).isRequired,
};

const RemoveButton = ({ model }) => {
  const remove = useCallback(() => {
    DataErase.add(model.id);
    // FIXME: ViewingListをrender()しないと表示が変わらない
    AppData.update(AppDataActions.ViewingList, (state) => state);
    AppData.update(AppDataActions.Modal, null);
  }, [model]);

  return (
    <Button color="default" fullWidth onClick={remove}>
      <Typography variant="button" color="textSecondary">
        この計測結果を削除する
      </Typography>
    </Button>
  );
};
RemoveButton.propTypes = {
  model: PropTypes.instanceOf(ViewingModel).isRequired,
};

const ViewingDetail = ({ model, regionalAverageQoE, hourlyAverageQoE }) => {
  const viewing = useViewing(model);
  if (viewing == null) return null;
  const {
    title,
    location,
    thumbnail,
    startTime,
    transferSize,
    quality,
    qoeCalculatable,
  } = viewing;

  const Title = () => (
    <Grid container component={Box} paddingX={2} paddingY={1}>
      <Grid item className={style.title}>
        {title}
      </Grid>
    </Grid>
  );

  return (
    <div className={style.modalMain}>
      <div className={style.header}>
        <VideoLinkWithThumbnail
          location={location}
          title={title}
          thumbnail={thumbnail}
        />
        <VideoInfo location={location} startTime={startTime} />
      </div>
      <Title />
      <VideoQuality
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...quality}
        startTime={startTime}
        transferSize={transferSize}
      />
      {qoeCalculatable ? (
        <Box mt={2} px={1}>
          <QoE
            model={viewing}
            regionalStats={regionalAverageQoE}
            hourlyStats={hourlyAverageQoE}
          />
        </Box>
      ) : null}
      <RemoveButton model={viewing} />
    </div>
  );
};
ViewingDetail.propTypes = {
  model: PropTypes.instanceOf(ViewingModel).isRequired,
  regionalAverageQoE: PropTypes.instanceOf(RegionalAverageQoE).isRequired,
  hourlyAverageQoE: PropTypes.instanceOf(HourlyAverageQoE).isRequired,
};
export default React.memo(ViewingDetail);
