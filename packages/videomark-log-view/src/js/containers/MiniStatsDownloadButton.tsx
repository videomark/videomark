import React, { useContext, useCallback } from "react";
// @ts-expect-error ts-migrate(6142) FIXME: Module '@videomark/videomark-mini-stats' was resol... Remove this comment to see the full error message
import { shareOrDownload } from "@videomark/videomark-mini-stats";
import { withStyles } from "@material-ui/core/styles";
import MuiButton from "@material-ui/core/Button";
import teal from "@material-ui/core/colors/teal";
// @ts-expect-error ts-migrate(6142) FIXME: Module './StatsDataProvider' was resolved to '/hom... Remove this comment to see the full error message
import { StatsDataContext } from "./StatsDataProvider";

const Button = withStyles((theme) => ({
  root: {
    paddingLeft: theme.spacing(6),
    paddingRight: theme.spacing(6),
    fontSize: 20,
    color: theme.palette.getContrastText(teal[500]),
    backgroundColor: teal[500],
    "&:hover": {
      backgroundColor: teal[700],
    },
  },
}))(MuiButton);

type OwnProps = {
    children?: string;
};

// @ts-expect-error ts-migrate(2456) FIXME: Type alias 'Props' circularly references itself.
type Props = OwnProps & typeof MiniStatsDownloadButton.defaultProps;

// @ts-expect-error ts-migrate(7022) FIXME: 'MiniStatsDownloadButton' implicitly has type 'any... Remove this comment to see the full error message
export const MiniStatsDownloadButton = ({ children }: Props) => {
  const {
    length,
    playingTime,
    totalPlayingTime,
    totalWaitingTime,
    droppedVideoFrames,
    totalVideoFrames,
    qoeStats,
  } = useContext(StatsDataContext);
  const miniStatsData = {
    count: length,
    playingTime,
    averageQoE: qoeStats.sum / qoeStats.count,
    averageWaitingRatio: totalWaitingTime / totalPlayingTime,
    averageDroppedVideoFrameRatio: droppedVideoFrames / totalVideoFrames,
  };
  const onClick = useCallback(() => shareOrDownload(miniStatsData), [length]);

  // @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
  return <Button onClick={onClick}>{children}</Button>;
};
MiniStatsDownloadButton.defaultProps = {
  children: null,
};
export default MiniStatsDownloadButton;
