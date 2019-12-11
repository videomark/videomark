import * as React from "react";
import startOfWeek from "date-fns/startOfWeek";
import subWeeks from "date-fns/subWeeks";
import differenceInDays from "date-fns/differenceInDays";
import addDays from "date-fns/addDays";
import getDate from "date-fns/getDate";
import format from "date-fns/format";
import locale from "date-fns/locale/ja";
import { clamp, floor } from "./math";
import { PlayingTimeWithDate, sliceDate, minAndMax } from "./stats";
import JPText from "./JPText";

const width = 400;
const weeks = 16;
const daySize = width / weeks;

const maxLuminance = 93.3; // %
const minLuminance = 35; // %
const clampLuminance = clamp(minLuminance, maxLuminance);

const labelFontSize = 14;

/** 値が存在しない時の色 */
const blankColor = `hsl(0,0%,${maxLuminance}%)`;

/** @param rate 0 のとき薄い色、1 のとき濃い色を返す */
const rateToColor = (rate: number) => {
  if (!Number.isFinite(rate)) return blankColor;
  return `hsl(161,33%,${clampLuminance(
    (maxLuminance - minLuminance) * (1 - rate) + minLuminance
  )}%)`;
};

/** width of days border. */
const dayBorderWidth = 2;
/** color to use for days border. */
const dayBorderColor = "#ffffff";

interface CalendarDayProps extends React.SVGProps<SVGRectElement> {
  rate: number;
}

/** props.rate が 0 のとき薄い色、1 のとき濃い色の■ */
const CalendarDay: React.FC<CalendarDayProps> = ({ rate, ...props }) => (
  <rect
    width={daySize}
    height={daySize}
    fill={rateToColor(rate)}
    stroke={dayBorderColor}
    strokeWidth={dayBorderWidth}
    {...props}
  />
);

/** 表示する範囲の最初の日曜日 */
const beginDate = (now: Date) => {
  const start = startOfWeek(subWeeks(now, weeks - 1));
  return start;
};

/** 日付を平面座標にマッピング */
const dateToXY = (begin: Date, daySize: number) => {
  return (date: Date) => {
    const n = differenceInDays(date, begin);
    const x = daySize * floor(n / 7);
    const y = daySize * (n % 7);
    return [x, y];
  };
};

interface CalendarProps extends React.SVGProps<SVGGElement> {
  data: PlayingTimeWithDate;
}

export const Calendar: React.FC<CalendarProps> = ({ data, ...gprops }) => {
  const now = new Date();
  const begin = beginDate(now);
  const days = sliceDate(data, begin);
  const [minValue, maxValue] = minAndMax(days);
  const rate = (value: number) =>
    minValue === maxValue
      ? value / value
      : (value - minValue) / (maxValue - minValue);
  const toXY = dateToXY(begin, daySize);
  const includingBlank = [
    ...Array(differenceInDays(addDays(now, 1), begin)).keys()
  ].map(index => {
    const date = addDays(begin, index);
    const day = format(date, "yyyy-MM-dd");
    return { day, date, value: days.get(day) || NaN };
  });
  const components = includingBlank.flatMap(({ day, date, value }) => {
    const [x, y] = toXY(date);
    const text = format(date, "MMM", { locale });
    return [
      ...(getDate(date) === 1
        ? [
            <JPText
              key={text}
              x={x + daySize / 2}
              y={0}
              textAnchor="middle"
              dominantBaseline="text-before-edge"
              fontSize={labelFontSize}
            >
              {text}
            </JPText>
          ]
        : []),
      <CalendarDay key={day} x={x} y={y + 20} rate={rate(value)} />
    ];
  });
  return <g {...gprops}>{components}</g>;
};

export default Calendar;
