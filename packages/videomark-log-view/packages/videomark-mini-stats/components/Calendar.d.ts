import * as React from "react";
import { PlayingTimeWithDate } from "./stats";
interface CalendarProps extends React.SVGProps<SVGGElement> {
    data: PlayingTimeWithDate;
}
export declare const Calendar: React.FC<CalendarProps>;
export default Calendar;
