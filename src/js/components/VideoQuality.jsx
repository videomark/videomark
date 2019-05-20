import * as React from "react";
import PropTypes from "prop-types";
import { Grid, Typography } from "@material-ui/core";
import { Warning } from "@material-ui/icons";
import { withStyles } from "@material-ui/core/styles";

const styles = () => ({
  typography: {
    useNextVariants: true
  },
  warningIcon: {
    fontSize: 20,
    verticalAlign: "bottom"
  }
});

const VideoQuality = ({
  classes,
  framerate: fps,
  droppedVideoFrames: dropped,
  totalVideoFrames: total
}) => {
  if ([fps, dropped / total].some(n => !Number.isFinite(n))) return null;
  const isLowQuality = dropped / total > 1e-3;

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
        <Typography
          component="dd"
          gutterBottom={isLowQuality}
          color={isLowQuality ? "error" : "default"}
        >
          {`${((dropped / total) * 100).toFixed(2)} % (${dropped} / ${total})`}
        </Typography>
      </Grid>
      {isLowQuality ? (
        <Grid item xs={12}>
          <Typography variant="caption" component="small" color="error">
            <Warning className={classes.warningIcon} />
            フレームドロップが発生したため実際の体感品質とは異なる可能性があります。
          </Typography>
        </Grid>
      ) : null}
    </Grid>
  );
};

VideoQuality.propTypes = {
  classes: PropTypes.instanceOf(Object).isRequired,
  framerate: PropTypes.number,
  droppedVideoFrames: PropTypes.number,
  totalVideoFrames: PropTypes.number
};
VideoQuality.defaultProps = {
  framerate: undefined,
  droppedVideoFrames: undefined,
  totalVideoFrames: undefined
};

export default withStyles(styles)(VideoQuality);
