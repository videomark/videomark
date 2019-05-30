import * as React from "react";
import PropTypes from "prop-types";
import style from "../../css/QoEValueGraph.module.css";

const QoEValueGraph = ({ label, qoe, modal }) => {
  if (qoe === undefined) return null;
  const valueBarStyle = { width: `${(qoe / 5.0) * 100}%` };
  return (
    <div className={style.qoeGraphRoot}>
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
        <p className={style.qoeValue}>{qoe.toFixed(2)}</p>
      </div>
    </div>
  );
};

QoEValueGraph.propTypes = {
  label: PropTypes.string.isRequired,
  qoe: PropTypes.number.isRequired,
  modal: PropTypes.bool
};

QoEValueGraph.defaultProps = {
  modal: false
};

export default QoEValueGraph;
