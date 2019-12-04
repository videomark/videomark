import * as React from "react";
interface CalendarProps extends React.SVGProps<SVGGElement> {
    data: Array<{
        day: string;
        value: number;
    }>;
}
export declare const Calendar: React.FC<CalendarProps>;
export default Calendar;
