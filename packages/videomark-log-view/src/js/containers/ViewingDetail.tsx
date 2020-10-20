
import React, { useState, useEffect, useCallback } from "react";
import Button from "@material-ui/core/Button";
import Grid from "@material-ui/core/Grid";
import Box from "@material-ui/core/Box";
import Typography from "@material-ui/core/Typography";
// @ts-expect-error ts-migrate(6142) FIXME: Module '../components/QoEValueGraphList' was resol... Remove this comment to see the full error message
import QoEValueGraphList from "../components/QoEValueGraphList";
// @ts-expect-error ts-migrate(6142) FIXME: Module '../components/VideoQuality' was resolved t... Remove this comment to see the full error message
import { VideoQuality, isLowQuality } from "../components/VideoQuality";
import DataErase from "../utils/DataErase";
import AppDataActions from "../utils/AppDataActions";
import AppData from "../utils/AppData";
import { urlToVideoPlatform } from "../utils/Utils";
// @ts-expect-error ts-migrate(2307) FIXME: Cannot find module '../../css/MeasureContents.modu... Remove this comment to see the full error message
import style from "../../css/MeasureContents.module.css";
import ViewingModel from "../utils/Viewing";
import RegionalAverageQoE from "../utils/RegionalAverageQoE";
import HourlyAverageQoE from "../utils/HourlyAverageQoE";
// @ts-expect-error ts-migrate(6142) FIXME: Module './Viewing' was resolved to '/home/kou029w/... Remove this comment to see the full error message
import { VideoThumbnail, toTimeString, useViewing } from "./Viewing";

type OwnVideoLinkWithThumbnailProps = {
    location: string;
    title: string;
    thumbnail?: string;
};

// @ts-expect-error ts-migrate(2456) FIXME: Type alias 'VideoLinkWithThumbnailProps' circularl... Remove this comment to see the full error message
type VideoLinkWithThumbnailProps = OwnVideoLinkWithThumbnailProps & typeof VideoLinkWithThumbnail.defaultProps;

// @ts-expect-error ts-migrate(7022) FIXME: 'VideoLinkWithThumbnail' implicitly has type 'any'... Remove this comment to see the full error message
const VideoLinkWithThumbnail = ({ location, title, thumbnail }: VideoLinkWithThumbnailProps) => (
  // @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
  <a href={location} target="_blank" rel="noopener noreferrer">
    {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
    <VideoThumbnail
      className={style.modalThumbnail}
      title={title}
      thumbnail={thumbnail}
    />
  </a>
);
VideoLinkWithThumbnail.defaultProps = {
  thumbnail: null,
};

type VideoInfoProps = {
    location: string;
    startTime: any; // TODO: PropTypes.instanceOf(Date)
};

const VideoInfo = ({ location, startTime }: VideoInfoProps) => (
  // @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
  <div className={style.movieInfo}>
    {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
    <span>{urlToVideoPlatform(location).name}</span>
    {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
    <span>{toTimeString(startTime)}</span>
  </div>
);

type QoEProps = {
    model: any; // TODO: PropTypes.instanceOf(ViewingModel)
    regionalStats: any; // TODO: PropTypes.instanceOf(RegionalAverageQoE)
    hourlyStats: any; // TODO: PropTypes.instanceOf(HourlyAverageQoE)
};

const QoE = ({ model, regionalStats, hourlyStats }: QoEProps) => {
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
      // @ts-expect-error ts-migrate(2345) FIXME: Object literal may only specify known properties, ... Remove this comment to see the full error message
      dispatch({ qoe, hourlyAverage, region, regionalAverage });
    })();
  }, [viewing, dispatch]);

  if (viewing == null) return null;
  const { startTime, quality } = viewing;

  if (state == null) return null;
  // @ts-expect-error ts-migrate(2339) FIXME: Property 'qoe' does not exist on type 'undefined'.
  const { qoe, region, hourlyAverage, regionalAverage } = state;

  return (
    // @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
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

type RemoveButtonProps = {
    model: any; // TODO: PropTypes.instanceOf(ViewingModel)
};

const RemoveButton = ({ model }: RemoveButtonProps) => {
  const remove = useCallback(() => {
    DataErase.add(model.id);
    // FIXME: ViewingListをrender()しないと表示が変わらない
    AppData.update(AppDataActions.ViewingList, (state: any) => state);
    AppData.update(AppDataActions.Modal, null);
  }, [model]);

  return (
    // @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
    <Button color="default" fullWidth onClick={remove}>
      {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
      <Typography variant="button" color="textSecondary">
        この計測結果を削除する
      </Typography>
    </Button>
  );
};

type ViewingDetailProps = {
    model: any; // TODO: PropTypes.instanceOf(ViewingModel)
    regionalAverageQoE: any; // TODO: PropTypes.instanceOf(RegionalAverageQoE)
    hourlyAverageQoE: any; // TODO: PropTypes.instanceOf(HourlyAverageQoE)
};

const ViewingDetail = ({ model, regionalAverageQoE, hourlyAverageQoE }: ViewingDetailProps) => {
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
    // @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
    <Grid container component={Box} paddingX={2} paddingY={1}>
      {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
      <Grid item className={style.title}>
        {title}
      </Grid>
    </Grid>
  );

  return (
    // @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
    <div className={style.modalMain}>
      {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
      <div className={style.header}>
        {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
        <VideoLinkWithThumbnail
          location={location}
          title={title}
          thumbnail={thumbnail}
        />
        {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
        <VideoInfo location={location} startTime={startTime} />
      </div>
      {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
      <Title />
      {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
      <VideoQuality
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...quality}
        startTime={startTime}
        transferSize={transferSize}
      />
      {qoeCalculatable ? (
        // @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
        <Box mt={2} px={1}>
          {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
          <QoE
            model={viewing}
            regionalStats={regionalAverageQoE}
            hourlyStats={hourlyAverageQoE}
          />
        </Box>
      ) : null}
      {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
      <RemoveButton model={viewing} />
    </div>
  );
};
export default React.memo(ViewingDetail);
