import React, { useContext, useCallback } from "react";
import PropTypes from "prop-types";
import { shareOrDownload } from "videomark-mini-stats";
import { withStyles } from "@material-ui/core/styles";
import MuiButton from "@material-ui/core/Button";
import teal from "@material-ui/core/colors/teal";
import { StatsDataContext } from "./StatsDataProvider";

const Button = withStyles(theme => ({
  root: {
    paddingLeft: theme.spacing(6),
    paddingRight: theme.spacing(6),
    fontSize: 20,
    color: theme.palette.getContrastText(teal[500]),
    backgroundColor: teal[500],
    "&:hover": {
      backgroundColor: teal[700]
    }
  }
}))(MuiButton);

export const MiniStatsDownloadButton = ({ children }) => {
  const {
    length,
    playingTime,
    totalPlayingTime,
    totalWaitingTime,
    droppedVideoFrames,
    totalVideoFrames,
    qoeStats
  } = useContext(StatsDataContext);
  const miniStatsData = {
    count: length,
    playingTime,
    averageQoE: qoeStats.sum / qoeStats.count,
    averageWaitingRatio: totalWaitingTime / totalPlayingTime,
    averageDroppedVideoFrameRatio: droppedVideoFrames / totalVideoFrames
  };
  const onClick = useCallback(() => shareOrDownload(miniStatsData), [length]);

  return <Button onClick={onClick}>{children}</Button>;
};
MiniStatsDownloadButton.propTypes = {
  children: PropTypes.string
};
MiniStatsDownloadButton.defaultProps = {
  children: null
};
export default MiniStatsDownloadButton;
