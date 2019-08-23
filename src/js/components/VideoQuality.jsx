import * as React from "react";
import PropTypes from "prop-types";
import Box from "@material-ui/core/Box";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import formatDistanceStrict from "date-fns/formatDistanceStrict";
import locale from "date-fns/locale/ja";

export const isLowQuality = ({ droppedVideoFrames, totalVideoFrames }) =>
  !(droppedVideoFrames / totalVideoFrames <= 1e-3);

const DItem = ({ dt, dd, na }) => {
  const color = na ? "textSecondary" : "inherit";
  return (
    <Grid item xs={6} sm={4}>
      <Typography align="center" component="dt" variant="body2" color={color}>
        {dt}
      </Typography>
      <Typography align="center" component="dd" variant="body2" color={color}>
        {dd}
      </Typography>
    </Grid>
  );
};
DItem.propTypes = {
  dt: PropTypes.string.isRequired,
  dd: PropTypes.string.isRequired,
  na: PropTypes.bool.isRequired
};

export const VideoQuality = ({
  startTime,
  date,
  bitrate,
  resolution,
  framerate,
  speed,
  droppedVideoFrames,
  totalVideoFrames,
  timing
}) => {
  const { width: videoWidth, height: videoHeight } = resolution || {};
  const { waiting, pause } = timing || {};
  const playing = date - startTime - pause;
  const classes = {
    bitrate: {
      na: !(bitrate >= 0)
    },
    resolution: {
      na: ![videoWidth, videoHeight].every(l => l >= 0)
    },
    framerate: {
      na: !(framerate >= 0)
    },
    dropped: {
      na: !Number.isFinite(droppedVideoFrames / totalVideoFrames)
    },
    waiting: {
      na: !Number.isFinite(waiting / playing)
    },
    playing: {
      na: !Number.isFinite(playing)
    }
  };

  return (
    <Grid container>
      <Grid item xs={12} component="dl" container spacing={1}>
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
        <DItem
          dt="解像度"
          dd={classes.resolution.na ? "n/a" : `${videoWidth} × ${videoHeight}`}
          /* eslint-disable-next-line react/jsx-props-no-spreading */
          {...classes.resolution}
        />
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
        <DItem
          dt="フレームドロップ率"
          dd={`${((droppedVideoFrames / totalVideoFrames) * 100).toFixed(
            2
          )} % (${droppedVideoFrames} / ${totalVideoFrames})`}
          /* eslint-disable-next-line react/jsx-props-no-spreading */
          {...classes.dropped}
        />
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
        <DItem
          dt="再生時間"
          dd={
            classes.playing.na
              ? "n/a"
              : `${formatDistanceStrict(0, playing, {
                  unit: "second",
                  locale
                })}`
          }
          /* eslint-disable-next-line react/jsx-props-no-spreading */
          {...classes.playing}
        />
      </Grid>
      {isLowQuality({
        droppedVideoFrames,
        totalVideoFrames
      }) ? (
        <Grid item xs={12} container justify="center">
          <Grid item>
            <Box mt={1}>
              <Typography
                align="center"
                variant="caption"
                component="small"
                color="textSecondary"
              >
                フレームドロップが発生したため実際の体感品質とは異なる可能性があります。
              </Typography>
            </Box>
          </Grid>
        </Grid>
      ) : null}
    </Grid>
  );
};
VideoQuality.propTypes = {
  startTime: PropTypes.instanceOf(Date),
  date: PropTypes.instanceOf(Date),
  bitrate: PropTypes.number,
  resolution: PropTypes.instanceOf(Object),
  framerate: PropTypes.number,
  speed: PropTypes.number,
  droppedVideoFrames: PropTypes.number,
  totalVideoFrames: PropTypes.number,
  timing: PropTypes.instanceOf(Object)
};
VideoQuality.defaultProps = {
  startTime: undefined,
  date: undefined,
  bitrate: undefined,
  resolution: undefined,
  framerate: undefined,
  speed: undefined,
  droppedVideoFrames: undefined,
  totalVideoFrames: undefined,
  timing: undefined
};

export default VideoQuality;
