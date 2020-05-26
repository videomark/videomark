import * as React from "react";
import { StatsData } from "./components/stats";
declare const SVG: React.FC<{
    data: StatsData;
}>;
export declare const shareOrDownload: (data: StatsData) => Promise<void>;
export default SVG;
