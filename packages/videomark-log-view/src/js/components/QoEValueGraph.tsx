import * as React from "react";
import Box from "@material-ui/core/Box";
// @ts-expect-error ts-migrate(2307) FIXME: Cannot find module '../../css/QoEValueGraph.module... Remove this comment to see the full error message
import style from "../../css/QoEValueGraph.module.css";

type OwnProps = {
    label: string;
    qoe?: number;
    color?: string;
};

// @ts-expect-error ts-migrate(2456) FIXME: Type alias 'Props' circularly references itself.
type Props = OwnProps & typeof QoEValueGraph.defaultProps;

// @ts-expect-error ts-migrate(7022) FIXME: 'QoEValueGraph' implicitly has type 'any' because ... Remove this comment to see the full error message
const QoEValueGraph = ({ label, qoe, color }: Props) => {
  if (qoe === undefined) return null;
  const valueBarStyle = {
    width: `${Number.isFinite(qoe) ? (qoe / 5.0) * 100 : 0}%`,
  };
  const palette = {
    qoeValueBar: {
      bgcolor: color === "default" ? "#75c6ac" : color,
    },
  };
  // @ts-expect-error ts-migrate(2339) FIXME: Property 'backgroudColor' does not exist on type '... Remove this comment to see the full error message
  if (color !== "default") valueBarStyle.backgroudColor = color;
  return (
    // @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
    <div className={style.qoeValueGraph}>
      {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
      <p className={style.label}>{label}</p>
      {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
      <div className={style.qoeBarGraph}>
        {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
        <Box
          className={style.qoeValueBar}
          style={valueBarStyle}
          {...palette.qoeValueBar} // eslint-disable-line react/jsx-props-no-spreading
        />
        {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
        <div className={style.qoeBarGraphBaseRoot}>
          {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
          <div className={style.qoeBarGraphBase} />
          {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
          <div className={style.qoeBarGraphBase} />
          {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
          <div className={style.qoeBarGraphBase} />
          {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
          <div className={style.qoeBarGraphBase} />
          {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
          <div className={style.qoeBarGraphBase} />
        </div>
      </div>
      {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
      <p className={style.qoeValue}>
        {Number.isFinite(qoe) ? qoe.toFixed(2) : null}
      </p>
    </div>
  );
};
QoEValueGraph.defaultProps = {
  qoe: NaN,
  color: "default",
};

export default QoEValueGraph;
