import * as React from "react";
import refresh from "../../images/refresh.svg";
import times from "../../images/times.svg";

export const Refresh = () => {
  return <img src={refresh} alt="refresh" />;
};

export const CrossIcon = () => {
  return <img src={times} alt="close" />;
};
