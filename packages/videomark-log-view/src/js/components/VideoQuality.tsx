import * as React from "react";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import formatDistanceStrict from "date-fns/formatDistanceStrict";
import locale from "date-fns/locale/ja";
import { megaSizeFormat } from "../utils/Utils";

export const isLowQuality = ({
  droppedVideoFrames,
  totalVideoFrames
}: any) =>
  !(droppedVideoFrames / totalVideoFrames <= 1e-3);

type DItemProps = {
    dt: string;
    dd: string;
    na: boolean;
};

const DItem = ({ dt, dd, na }: DItemProps) => {
  const color = na ? "textSecondary" : "inherit";
  return (
    // @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
    <Grid item xs={6} sm={4}>
      {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
      <Typography align="center" component="dt" variant="body2" color={color}>
        {dt}
      </Typography>
      {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
      <Typography align="center" component="dd" variant="body2" color={color}>
        {dd}
      </Typography>
    </Grid>
  );
};

type OwnVideoQualityProps = {
    startTime?: any; // TODO: PropTypes.instanceOf(Date)
    transferSize?: number;
    date?: any; // TODO: PropTypes.instanceOf(Date)
    bitrate?: number;
    resolution?: any; // TODO: PropTypes.instanceOf(Object)
    framerate?: number;
    speed?: number;
    droppedVideoFrames?: number;
    totalVideoFrames?: number;
    timing?: any; // TODO: PropTypes.instanceOf(Object)
};

// @ts-expect-error ts-migrate(2456) FIXME: Type alias 'VideoQualityProps' circularly referenc... Remove this comment to see the full error message
type VideoQualityProps = OwnVideoQualityProps & typeof VideoQuality.defaultProps;

// @ts-expect-error ts-migrate(7022) FIXME: 'VideoQuality' implicitly has type 'any' because i... Remove this comment to see the full error message
export const VideoQuality = ({ startTime, transferSize, date, bitrate, resolution, framerate, speed, droppedVideoFrames, totalVideoFrames, timing, }: VideoQualityProps) => {
  const { width: videoWidth, height: videoHeight } = resolution || {};
  const { waiting, pause } = timing || {};
  const playing = date - startTime - pause;
  const classes = {
    bitrate: {
      na: !(bitrate >= 0),
    },
    resolution: {
      na: ![videoWidth, videoHeight].every((l) => l >= 0),
    },
    framerate: {
      na: !(framerate >= 0),
    },
    dropped: {
      na: !Number.isFinite(droppedVideoFrames / totalVideoFrames),
    },
    waiting: {
      na: !Number.isFinite(waiting / playing),
    },
    playing: {
      na: !Number.isFinite(playing),
    },
    transferSize: {
      na: !Number.isFinite(transferSize),
    },
  };

  return (
    // @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
    <Grid container>
      {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
      <Grid item xs={12} component="dl" container spacing={1}>
        {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
        <DItem
          dt="ビットレート"
          dd={
            classes.bitrate.na
              ? "n/a"
              : `${(bitrate / 1e3).toLocaleString()} kbps`
          }
          /* eslint-disable-next-line react/jsx-props-no-spreading */
          {...classes.bitrate}
        />
        {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
        <DItem
          dt="解像度"
          dd={classes.resolution.na ? "n/a" : `${videoWidth} × ${videoHeight}`}
          /* eslint-disable-next-line react/jsx-props-no-spreading */
          {...classes.resolution}
        />
        {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
        <DItem
          dt="フレームレート"
          dd={
            classes.framerate.na
              ? "n/a"
              : `${framerate} fps${speed === 1 ? "" : ` × ${speed}`}`
          }
          /* eslint-disable-next-line react/jsx-props-no-spreading */
          {...classes.framerate}
        />
        {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
        <DItem
          dt="フレームドロップ率"
          dd={`${((droppedVideoFrames / totalVideoFrames) * 100).toFixed(
            2
          )} % (${droppedVideoFrames} / ${totalVideoFrames})`}
          /* eslint-disable-next-line react/jsx-props-no-spreading */
          {...classes.dropped}
        />
        {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
        <DItem
          dt="待機時間"
          dd={
            classes.waiting.na
              ? "n/a"
              : `${(waiting / 1e3).toFixed(2)}秒 ( ${(
                  (waiting / playing) *
                  100
                ).toFixed(2)} % )`
          }
          /* eslint-disable-next-line react/jsx-props-no-spreading */
          {...classes.waiting}
        />
        {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
        <DItem
          dt="再生時間"
          dd={
            classes.playing.na
              ? "n/a"
              : `${formatDistanceStrict(0, playing, {
                  unit: "second",
                  locale,
                })}`
          }
          /* eslint-disable-next-line react/jsx-props-no-spreading */
          {...classes.playing}
        />
        {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
        <DItem
          dt="通信量"
          dd={
            classes.transferSize.na
              ? "n/a"
              : `${megaSizeFormat(transferSize)} MB`
          }
          /* eslint-disable-next-line react/jsx-props-no-spreading */
          {...classes.transferSize}
        />
      </Grid>
    </Grid>
  );
};
VideoQuality.defaultProps = {
  startTime: undefined,
  transferSize: undefined,
  date: undefined,
  bitrate: undefined,
  resolution: undefined,
  framerate: undefined,
  speed: undefined,
  droppedVideoFrames: undefined,
  totalVideoFrames: undefined,
  timing: undefined,
};

export default VideoQuality;
