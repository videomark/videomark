import React from "react";
import PropTypes from "prop-types";
import QoEValueGraph from "./QoEValueGraph";
import style from "../../css/MeasureContents.module.css";
import Country from "../utils/Country";
import Subdivision from "../utils/Subdivision";

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

  const { country, subdivision } = region || {};
  const regionDisplayName = Country.isJapan(country)
    ? Subdivision.codeToName(subdivision)
    : Country.codeToName(country);
  const unknown = "不明";
  const regionLabel =
    regionDisplayName === undefined ? unknown : regionDisplayName;
  const regionalAverageValue =
    regionDisplayName === undefined ? 0 : regionalAverage;
  const hourDisplayName = hour === undefined ? unknown : `${hour}時`;
  const hourlyAverageValue = hour === undefined ? 0 : hourlyAverage;

  return (
    <div className={style.qoeDate}>
      <div className={style.userGraph}>
        <div className={style.graph}>
          <QoEValueGraph label="品質" qoe={value} modal={isDetail} />
        </div>
      </div>
      <div className={style.expanded}>
        <div className={style.graph}>
          <QoEValueGraph
            label={regionLabel}
            qoe={regionalAverageValue}
            modal={isDetail}
          />
          <QoEValueGraph
            label={hourDisplayName}
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
