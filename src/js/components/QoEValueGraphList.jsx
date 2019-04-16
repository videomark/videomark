import React from "react";
import PropTypes from "prop-types";
import QoEValueGraph from "./QoEValueGraph";
import style from "../../css/MeasureContents.module.css";
import { createKey } from "../utils/Utils";

const QoEValueGraphList = ({ qoe, average, isDetail }) => {
  switch (Number(qoe)) {
    case -1:
      return (
        <div className={style.qoeDate}>
          <div className={style.userGraph}>
            <div>体感品質値を計測または計算中です</div>
          </div>
        </div>
      );
    case 0: // FIXME: 値が得られないとき0になる
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

  return (
    <div className={style.qoeDate}>
      <div className={style.userGraph}>
        <div className={style.graph}>
          <QoEValueGraph
            label="この動画再生時の体感品質値"
            qoe={qoe}
            modal={isDetail}
          />
        </div>
      </div>
      <div className={style.expanded}>
        {average.map(item => (
          <div key={createKey()} className={style.graph}>
            <QoEValueGraph
              label={isDetail ? item.modalLabel : item.label}
              qoe={item.value}
              modal={isDetail}
            />
          </div>
        ))}
      </div>
    </div>
  );
};
QoEValueGraphList.propTypes = {
  qoe: PropTypes.string.isRequired,
  average: PropTypes.shape.isRequired,
  isDetail: PropTypes.bool
};
QoEValueGraphList.defaultProps = {
  isDetail: false
};
export default QoEValueGraphList;
