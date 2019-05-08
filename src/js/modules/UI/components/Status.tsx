import React from "react";

const Status: React.FC<{ qoe: null | number }> = ({ qoe }) => {
  if (qoe == null) return <>計測中...</>;
  return <>QoE: {qoe.toFixed(2)}</>;
};
export default Status;
