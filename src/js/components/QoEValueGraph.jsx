import * as React from "react";
import PropTypes from "prop-types";

import style from "../../css/QoEValueGraph.module.css";

const QoeCalcWaiting = props => {
  const { state } = props;
  if (state.IsViewing()) {
    return <div>体感品質値を計測または計算中です</div>;
  }
  return <div>計測データ不足のため体感品質値が得られませんでした</div>;
};

QoeCalcWaiting.propTypes = {
  state: PropTypes.shape({
    state: PropTypes.number.isRequired
  }).isRequired
};

const QoEValueGraph = props => {
  const { label, qoe, modal, state } = props;

  const valueBarStyle = { width: `${(qoe / 5.0) * 100}%` };
  return (
    <div className={style.qoeGraphRoot}>
      {state === null || state.IsCompleted() ? (
        <div
          className={`${style.qoeValueGraph} ${
            modal ? style.modalQoeValueGraph : ""
          }`}
        >
          <p className={style.label}>{label}</p>
          <div className={style.qoeBarGraph}>
            <div className={style.qoeValueBar} style={valueBarStyle} />
            <div className={style.qoeBarGraphBaseRoot}>
              <div className={style.qoeBarGraphBase} />
              <div className={style.qoeBarGraphBase} />
              <div className={style.qoeBarGraphBase} />
              <div className={style.qoeBarGraphBase} />
              <div className={style.qoeBarGraphBase} />
            </div>
          </div>
          <p className={style.qoeValue}>{qoe}</p>
        </div>
      ) : (
        <QoeCalcWaiting state={state} />
      )}
    </div>
  );
};

QoEValueGraph.propTypes = {
  label: PropTypes.string.isRequired,
  qoe: PropTypes.string.isRequired,
  modal: PropTypes.bool,
  state: PropTypes.shape({
    state: PropTypes.number.isRequired
  })
};

QoEValueGraph.defaultProps = {
  className: "",
  state: null,
  modal: false
};

export default QoEValueGraph;
