import * as React from "react";
import PropTypes from "prop-types";
import { Grid, Typography } from "@material-ui/core";

const VideoQuality = ({
  framerate: fps,
  droppedVideoFrames: dropped,
  totalVideoFrames: total
}) => {
  if ([fps, dropped / total].some(n => !Number.isFinite(n))) return null;

  return (
    <Grid container>
      <Grid item xs component="dl">
        <Typography component="dt">フレームレート</Typography>
        <Typography component="dd">
          {fps === -1 ? "-" : `${fps} fps`}
        </Typography>
      </Grid>
      <Grid item xs>
        <Typography component="dt">フレームドロップ率</Typography>
        <Typography component="dd">
          {`${((dropped / total) * 100).toFixed(2)} % (${dropped} / ${total})`}
        </Typography>
      </Grid>
    </Grid>
  );
};

VideoQuality.propTypes = {
  framerate: PropTypes.number,
  droppedVideoFrames: PropTypes.number,
  totalVideoFrames: PropTypes.number
};
VideoQuality.defaultProps = {
  framerate: undefined,
  droppedVideoFrames: undefined,
  totalVideoFrames: undefined
};

export default VideoQuality;
