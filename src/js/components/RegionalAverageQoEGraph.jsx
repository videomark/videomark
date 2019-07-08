import React from "react";
import PropTypes from "prop-types";
import QoEValueGraph from "./QoEValueGraph";
import Country from "../utils/Country";
import Subdivision from "../utils/Subdivision";

const RegionalAverageQoEGraph = ({ region, regionalAverage, isDetail }) => {
  const { country, subdivision } = region || {};
  const regionDisplayName = Country.isJapan(country)
    ? Subdivision.codeToName(subdivision)
    : Country.codeToName(country);

  if (regionDisplayName === undefined) {
    const label = "不明";
    const detail = "視聴地域の推定に失敗";

    return (
      <QoEValueGraph
        label={isDetail ? detail : label}
        qoe={NaN}
        modal={isDetail}
      />
    );
  }

  const label = regionDisplayName;
  const detail = `同じ地域の体感品質の平均 (${regionDisplayName})`;
  return (
    <QoEValueGraph
      label={isDetail ? detail : label}
      qoe={regionalAverage}
      modal={isDetail}
    />
  );
};
RegionalAverageQoEGraph.propTypes = {
  region: PropTypes.shape({
    country: PropTypes.string,
    subdivision: PropTypes.string
  }),
  regionalAverage: PropTypes.number,
  isDetail: PropTypes.bool
};
RegionalAverageQoEGraph.defaultProps = {
  region: undefined,
  regionalAverage: undefined,
  isDetail: false
};

export default RegionalAverageQoEGraph;
