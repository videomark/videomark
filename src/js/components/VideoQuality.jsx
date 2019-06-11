import * as React from "react";
import PropTypes from "prop-types";
import Box from "@material-ui/core/Box";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";

const VideoQuality = ({
  framerate: fps,
  speed,
  droppedVideoFrames: dropped,
  totalVideoFrames: total
}) => {
  if ([fps, speed, dropped / total].some(n => !Number.isFinite(n))) return null;
  const isLowQuality = dropped / total > 1e-3;
  const palette = {
    framerate: {
      text: fps < 0 ? "textSecondary" : "inherit"
    }
  };

  return (
    <Grid container>
      <Grid item xs component="dl">
        <Typography
          component="dt"
          variant="body2"
          color={palette.framerate.text}
        >
          フレームレート
        </Typography>
        <Typography
          component="dd"
          variant="body2"
          color={palette.framerate.text}
        >
          {fps < 0 ? "n/a" : `${fps} fps${speed === 1 ? "" : ` × ${speed}`}`}
        </Typography>
      </Grid>
      <Grid item xs>
        <Typography component="dt" variant="body2">
          フレームドロップ率
        </Typography>
        <Typography component="dd" variant="body2" color="textPrimary">
          {`${((dropped / total) * 100).toFixed(2)} % (${dropped} / ${total})`}
        </Typography>
      </Grid>
      {isLowQuality ? (
        <Grid item xs={12}>
          <Box mt={1}>
            <Typography
              variant="caption"
              component="small"
              color="textSecondary"
            >
              フレームドロップが発生したため実際の体感品質とは異なる可能性があります。
            </Typography>
          </Box>
        </Grid>
      ) : null}
    </Grid>
  );
};

VideoQuality.propTypes = {
  framerate: PropTypes.number,
  speed: PropTypes.number,
  droppedVideoFrames: PropTypes.number,
  totalVideoFrames: PropTypes.number
};
VideoQuality.defaultProps = {
  framerate: undefined,
  speed: undefined,
  droppedVideoFrames: undefined,
  totalVideoFrames: undefined
};

export default VideoQuality;
