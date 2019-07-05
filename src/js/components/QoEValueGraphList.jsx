import React from "react";
import PropTypes from "prop-types";
import Typography from "@material-ui/core/Typography";
import QoEValueGraph from "./QoEValueGraph";
import RegionalAverageQoEGraph from "./RegionalAverageQoEGraph";

const QoEValueGraphList = ({
  value,
  region,
  regionalAverage,
  hour,
  hourlyAverage,
  isDetail,
  color
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
    <>
      <QoEValueGraph
        label={isDetail ? "視聴時の体感品質" : "体感品質"}
        qoe={value}
        modal={isDetail}
        color={color}
      />
      <RegionalAverageQoEGraph
        region={region}
        regionalAverage={regionalAverage}
        isDetail={isDetail}
      />
      <QoEValueGraph
        label={
          isDetail
            ? `同じ時間帯の体感品質の平均 (${hourDisplayName})`
            : hourDisplayName
        }
        qoe={hourlyAverageValue}
        modal={isDetail}
      />
    </>
  );
};
QoEValueGraphList.propTypes = {
  value: PropTypes.number,
  region: PropTypes.shape({
    country: PropTypes.string,
    subdivision: PropTypes.string
  }),
  regionalAverage: PropTypes.number,
  hour: PropTypes.number,
  hourlyAverage: PropTypes.number,
  isDetail: PropTypes.bool,
  color: PropTypes.string
};
QoEValueGraphList.defaultProps = {
  value: undefined,
  region: undefined,
  regionalAverage: undefined,
  hour: undefined,
  hourlyAverage: undefined,
  isDetail: false,
  color: "default"
};
export default QoEValueGraphList;
