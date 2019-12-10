import React, { useContext, useCallback } from "react";
import PropTypes from "prop-types";
import ReactDOMServer from "react-dom/server";
import MiniStatsSVG from "videomark-mini-stats";
import { withStyles } from "@material-ui/core/styles";
import MuiButton from "@material-ui/core/Button";
import teal from "@material-ui/core/colors/teal";
import { StatsDataContext } from "./StatsDataProvider";

const save = data => {
  const image = new Image();
  image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
    ReactDOMServer.renderToString(<MiniStatsSVG data={data} />)
  )}`;
  image.onload = () => {
    const canvas = document.createElement("canvas");
    canvas.width = image.width;
    canvas.height = image.height;
    canvas.getContext("2d").drawImage(image, 0, 0);

    const anchor = document.createElement("a");
    anchor.download = new Date().toLocaleString();
    anchor.href = canvas.toDataURL();
    anchor.click();
  };
};

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
  const onClick = useCallback(() => save(miniStatsData), [length]);

  return <Button onClick={onClick}>{children}</Button>;
};
MiniStatsDownloadButton.propTypes = {
  children: PropTypes.string
};
MiniStatsDownloadButton.defaultProps = {
  children: null
};
export default MiniStatsDownloadButton;
