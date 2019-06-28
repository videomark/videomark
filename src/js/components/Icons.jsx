import * as React from "react";
import helpIcon from "../../images/help.png";
import refresh from "../../images/refresh.svg";
import times from "../../images/times.svg";

export const Refresh = () => {
  return <img src={refresh} alt="refresh" />;
};

export const CrossIcon = () => {
  return <img src={times} alt="close" />;
};

export const Help = () => {
  return (
    <img
      src={helpIcon}
      alt="help-icon"
      widht={16}
      height={16}
      style={{ opacity: 0.5 }}
    />
  );
};
