import React from "react";
// @ts-expect-error ts-migrate(6142) FIXME: Module './QoEValueGraph' was resolved to '/home/ko... Remove this comment to see the full error message
import QoEValueGraph from "./QoEValueGraph";
import Country from "../utils/Country";
import Subdivision from "../utils/Subdivision";

type OwnProps = {
    region?: {
        country?: string;
        subdivision?: string;
    };
    regionalAverage?: number;
};

// @ts-expect-error ts-migrate(2456) FIXME: Type alias 'Props' circularly references itself.
type Props = OwnProps & typeof RegionalAverageQoEGraph.defaultProps;

// @ts-expect-error ts-migrate(7022) FIXME: 'RegionalAverageQoEGraph' implicitly has type 'any... Remove this comment to see the full error message
const RegionalAverageQoEGraph = ({ region, regionalAverage }: Props) => {
  const { country, subdivision } = region || {};
  const regionDisplayName = Country.isJapan(country)
    ? Subdivision.codeToName(subdivision)
    : Country.codeToName(country);

  if (regionDisplayName === undefined) {
    // @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
    return <QoEValueGraph label="視聴地域の推定に失敗" />;
  }

  return (
    // @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
    <QoEValueGraph
      label={`同じ地域の体感品質の平均 (${regionDisplayName})`}
      qoe={regionalAverage}
    />
  );
};
RegionalAverageQoEGraph.defaultProps = {
  region: undefined,
  regionalAverage: undefined,
};

export default RegionalAverageQoEGraph;
