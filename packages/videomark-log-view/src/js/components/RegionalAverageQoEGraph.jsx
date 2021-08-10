import React from "react";
import PropTypes from "prop-types";
import QoEValueGraph from "./QoEValueGraph";
import Country from "../utils/Country";
import Subdivision from "../utils/Subdivision";

const RegionalAverageQoEGraph = ({ region, regionalAverage }) => {
  const { country, subdivision } = region || {};
  const regionDisplayName = Country.isJapan(country)
    ? Subdivision.codeToName(subdivision)
    : Country.codeToName(country);

  if (regionDisplayName === undefined) {
    return <QoEValueGraph label="視聴地域の推定に失敗" />;
  }

  return (
    <QoEValueGraph
      label={`同じ地域の体感品質値の平均 (${regionDisplayName})`}
      qoe={regionalAverage}
    />
  );
};
RegionalAverageQoEGraph.propTypes = {
  region: PropTypes.shape({
    country: PropTypes.string,
    subdivision: PropTypes.string,
  }),
  regionalAverage: PropTypes.number,
};
RegionalAverageQoEGraph.defaultProps = {
  region: undefined,
  regionalAverage: undefined,
};

export default RegionalAverageQoEGraph;
