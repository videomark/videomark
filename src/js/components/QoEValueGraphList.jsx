import React from "react";
import PropTypes from "prop-types";
import QoEValueGraph from "./QoEValueGraph";
import style from "../../css/MeasureContents.module.css";
import RegionalAverageQoEGraph from "./RegionalAverageQoEGraph";

const QoEValueGraphList = ({
  value,
  region,
  regionalAverage,
  hour,
  hourlyAverage,
  isDetail
}) => {
  switch (value) {
    case -1:
      return (
        <div className={style.qoeDate}>
          <div className={style.userGraph}>
            <div>体感品質値を計測または計算中です</div>
          </div>
        </div>
      );
    case undefined:
    case -2:
      return (
        <div className={style.qoeDate}>
          <div className={style.userGraph}>
            <div>計測データ不足のため体感品質値が得られませんでした</div>
          </div>
        </div>
      );
    default:
      break;
  }

  const unknown = "不明";
  const hourDisplayName = hour === undefined ? unknown : `${hour}時`;
  const hourlyAverageValue = hour === undefined ? 0 : hourlyAverage;

  return (
    <div className={style.qoeDate}>
      <div className={style.userGraph}>
        <div className={style.graph}>
          <QoEValueGraph
            label={isDetail ? "視聴時の体感品質" : "体感品質"}
            qoe={value}
            modal={isDetail}
          />
        </div>
      </div>
      <div className={style.expanded}>
        <div className={style.graph}>
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
        </div>
      </div>
    </div>
  );
};
QoEValueGraphList.propTypes = {
  value: PropTypes.number.isRequired,
  region: PropTypes.shape({
    country: PropTypes.string,
    subdivision: PropTypes.string
  }),
  regionalAverage: PropTypes.number,
  hour: PropTypes.number,
  hourlyAverage: PropTypes.number,
  isDetail: PropTypes.bool
};
QoEValueGraphList.defaultProps = {
  region: undefined,
  regionalAverage: undefined,
  hour: undefined,
  hourlyAverage: undefined,
  isDetail: false
};
export default QoEValueGraphList;
