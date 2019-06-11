import * as React from "react";
import PropTypes from "prop-types";
import Box from "@material-ui/core/Box";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";

export const isLowQuality = ({ droppedVideoFrames, totalVideoFrames }) =>
  droppedVideoFrames / totalVideoFrames > 1e-3;

export const VideoQuality = ({
  framerate: fps,
  speed,
  droppedVideoFrames,
  totalVideoFrames
}) => {
  const palette = {
    framerate: {
      text: fps > 0 ? "inherit" : "textSecondary"
    }
  };

  return (
    <Grid container>
      <Grid item xs component="dl">
        <Typography
          align="center"
          component="dt"
          variant="body2"
          color={palette.framerate.text}
        >
          フレームレート
        </Typography>
        <Typography
          align="center"
          component="dd"
          variant="body2"
          color={palette.framerate.text}
        >
          {fps > 0 ? `${fps} fps${speed === 1 ? "" : ` × ${speed}`}` : "n/a"}
        </Typography>
      </Grid>
      <Grid item xs>
        <Typography align="center" component="dt" variant="body2">
          フレームドロップ率
        </Typography>
        <Typography
          align="center"
          component="dd"
          variant="body2"
          color="textPrimary"
        >
          {`${((droppedVideoFrames / totalVideoFrames) * 100).toFixed(
            2
          )} % (${droppedVideoFrames} / ${totalVideoFrames})`}
        </Typography>
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
