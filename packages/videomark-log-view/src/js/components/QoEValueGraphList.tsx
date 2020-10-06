import React from "react";
import Grid from "@material-ui/core/Grid";
import Box from "@material-ui/core/Box";
import Typography from "@material-ui/core/Typography";
// @ts-expect-error ts-migrate(6142) FIXME: Module './QoEValueGraph' was resolved to '/home/ko... Remove this comment to see the full error message
import QoEValueGraph from "./QoEValueGraph";
// @ts-expect-error ts-migrate(6142) FIXME: Module './RegionalAverageQoEGraph' was resolved to... Remove this comment to see the full error message
import RegionalAverageQoEGraph from "./RegionalAverageQoEGraph";

type OwnProps = {
    value?: number;
    region?: {
        country?: string;
        subdivision?: string;
    };
    regionalAverage?: number;
    hour?: number;
    hourlyAverage?: number;
    isLowQuality?: boolean;
};

// @ts-expect-error ts-migrate(2456) FIXME: Type alias 'Props' circularly references itself.
type Props = OwnProps & typeof QoEValueGraphList.defaultProps;

// @ts-expect-error ts-migrate(7022) FIXME: 'QoEValueGraphList' implicitly has type 'any' beca... Remove this comment to see the full error message
const QoEValueGraphList = ({ value, region, regionalAverage, hour, hourlyAverage, isLowQuality, }: Props) => {
  switch (value) {
    case -1:
      return (
        // @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
        <Typography align="center">体感品質値を計測または計算中です</Typography>
      );
    case undefined:
    case -2:
      return (
        // @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
        <Typography align="center">
          計測データ不足のため体感品質値が得られませんでした
        </Typography>
      );
    default:
      break;
  }

  const unknown = "不明";
  const hourDisplayName = hour === undefined ? unknown : `${hour}時`;
  const hourlyAverageValue = hour === undefined ? 0 : hourlyAverage;

  return (
    // @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
    <Grid item xs={12} container justify="center">
      {isLowQuality ? (
        // @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
        <Grid item>
          {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
          <Box mt={1}>
            {/* @ts-expect-error ts-migrate(2769) FIXME: Property 'compBoxonent' does not exist on type 'In... Remove this comment to see the full error message */}
            <Typography
              align="center"
              variant="caption"
              compBoxonent="small"
              color="textSecondary"
            >
              フレームドロップが発生したため実際の体感品質とは異なる可能性があります。
            </Typography>
          </Box>
        </Grid>
      ) : null}
      {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
      <QoEValueGraph
        label="視聴時の体感品質"
        qoe={value}
        color={isLowQuality ? "text.secondary" : "default"}
      />
      {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
      <RegionalAverageQoEGraph
        region={region}
        regionalAverage={regionalAverage}
      />
      {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
      <QoEValueGraph
        label={`同じ時間帯の体感品質の平均 (${hourDisplayName})`}
        qoe={hourlyAverageValue}
      />
    </Grid>
  );
};
QoEValueGraphList.defaultProps = {
  value: undefined,
  region: undefined,
  regionalAverage: undefined,
  hour: undefined,
  hourlyAverage: undefined,
  isLowQuality: false,
};
export default QoEValueGraphList;
