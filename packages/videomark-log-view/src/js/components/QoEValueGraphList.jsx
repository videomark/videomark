import React from "react";
import PropTypes from "prop-types";
import Grid from "@material-ui/core/Grid";
import Box from "@material-ui/core/Box";
import Typography from "@material-ui/core/Typography";
import QoEValueGraph from "./QoEValueGraph";
import RegionalAverageQoEGraph from "./RegionalAverageQoEGraph";

const QoEValueGraphList = ({
  value,
  region,
  regionalAverage,
  hour,
  hourlyAverage,
  isLowQuality,
}) => {
  switch (value) {
    case -1:
      return (
        <Typography align="center">体感品質値を計測または計算中です</Typography>
      );
    case undefined:
    case -2:
      return (
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
    <Grid item xs={12} container justify="center">
      {isLowQuality ? (
        <Grid item>
          <Box mt={1}>
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
      <QoEValueGraph
        label="視聴時の体感品質値"
        qoe={value}
        color={isLowQuality ? "text.secondary" : "default"}
      />
      <RegionalAverageQoEGraph
        region={region}
        regionalAverage={regionalAverage}
      />
      <QoEValueGraph
        label={`同じ時間帯の体感品質値の平均 (${hourDisplayName})`}
        qoe={hourlyAverageValue}
      />
    </Grid>
  );
};
QoEValueGraphList.propTypes = {
  value: PropTypes.number,
  region: PropTypes.shape({
    country: PropTypes.string,
    subdivision: PropTypes.string,
  }),
  regionalAverage: PropTypes.number,
  hour: PropTypes.number,
  hourlyAverage: PropTypes.number,
  isLowQuality: PropTypes.bool,
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
