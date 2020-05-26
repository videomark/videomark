import * as React from "react";
import PropTypes from "prop-types";
import Box from "@material-ui/core/Box";
import style from "../../css/QoEValueGraph.module.css";

const QoEValueGraph = ({ label, qoe, color }) => {
  if (qoe === undefined) return null;
  const valueBarStyle = {
    width: `${Number.isFinite(qoe) ? (qoe / 5.0) * 100 : 0}%`,
  };
  const palette = {
    qoeValueBar: {
      bgcolor: color === "default" ? "#75c6ac" : color,
    },
  };
  if (color !== "default") valueBarStyle.backgroudColor = color;
  return (
    <div className={style.qoeValueGraph}>
      <p className={style.label}>{label}</p>
      <div className={style.qoeBarGraph}>
        <Box
          className={style.qoeValueBar}
          style={valueBarStyle}
          {...palette.qoeValueBar} // eslint-disable-line react/jsx-props-no-spreading
        />
        <div className={style.qoeBarGraphBaseRoot}>
          <div className={style.qoeBarGraphBase} />
          <div className={style.qoeBarGraphBase} />
          <div className={style.qoeBarGraphBase} />
          <div className={style.qoeBarGraphBase} />
          <div className={style.qoeBarGraphBase} />
        </div>
      </div>
      <p className={style.qoeValue}>
        {Number.isFinite(qoe) ? qoe.toFixed(2) : null}
      </p>
    </div>
  );
};
QoEValueGraph.propTypes = {
  label: PropTypes.string.isRequired,
  qoe: PropTypes.number,
  color: PropTypes.string,
};
QoEValueGraph.defaultProps = {
  qoe: NaN,
  color: "default",
};

export default QoEValueGraph;
