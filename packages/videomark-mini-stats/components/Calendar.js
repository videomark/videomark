import * as React from "react";
import compareAsc from "date-fns/compareAsc";
import startOfWeek from "date-fns/startOfWeek";
import subWeeks from "date-fns/subWeeks";
import differenceInDays from "date-fns/differenceInDays";
import addDays from "date-fns/addDays";
import getDate from "date-fns/getDate";
import format from "date-fns/format";
import locale from "date-fns/locale/ja";
import JPText from "./JPText";
const width = 400;
// const height = 240;
const weeks = 16;
const daySize = width / weeks;
const { min, max } = Math;
const clamp = (minValue, maxValue) => (value) => {
    return max(minValue, min(maxValue, value));
};
const maxLuminance = 93.3; // %
const minLuminance = 35; // %
const clampLuminance = clamp(minLuminance, maxLuminance);
/** 値が存在しない時の色 */
const blankColor = `hsl(0,0%,${maxLuminance}%)`;
/** @param rate 0 のとき薄い色、1 のとき濃い色を返す */
const rateToColor = (rate) => {
    if (!Number.isFinite(rate))
        return blankColor;
    return `hsl(161,33%,${clampLuminance((maxLuminance - minLuminance) * (1 - rate) + minLuminance)}%)`;
};
/** width of days border. */
const dayBorderWidth = 2;
/** color to use for days border. */
const dayBorderColor = "#ffffff";
/** props.rate が 0 のとき薄い色、1 のとき濃い色の■ */
const CalendarDay = ({ rate, ...props }) => (React.createElement("rect", Object.assign({ width: daySize, height: daySize, fill: rateToColor(rate), stroke: dayBorderColor, strokeWidth: dayBorderWidth }, props)));
/** 文字列 yyyy-MM-dd を Date オブジェクトに変換 */
const withDate = (data) => data.map(({ day, value }) => ({ date: new Date(day), day, value }));
/** 昇順ソート */
const sortAsc = (days) => {
    return days.sort(({ date: a }, { date: b }) => compareAsc(a, b));
};
/** 表示する範囲の最初の日曜日 */
const beginDate = (now) => {
    const start = startOfWeek(subWeeks(now, weeks - 1));
    return start;
};
/** 任意の日より後ろの全要素 */
const sliceDate = (ascDays, begin) => {
    const startIndex = ascDays.findIndex(({ date }) => begin <= date);
    return new Map(ascDays.slice(startIndex).map(({ day, value }) => [day, value]));
};
/** 最小値と最大値 */
const minAndMax = (days) => {
    const values = [...days.values()];
    return [min(...values), max(...values)];
};
const { floor } = Math;
/** 日付を平面座標にマッピング */
const dateToXY = (begin, daySize) => {
    return (date) => {
        const n = differenceInDays(date, begin);
        const x = daySize * floor(n / 7);
        const y = daySize * (n % 7);
        return [x, y];
    };
};
export const Calendar = ({ data, ...gprops }) => {
    const now = new Date();
    const begin = beginDate(now);
    const ascDays = sortAsc(withDate(data));
    const days = sliceDate(ascDays, begin);
    const [minValue, maxValue] = minAndMax(days);
    const rate = (value) => (value - minValue) / (maxValue - minValue);
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
                    React.createElement(JPText, { key: text, x: x, y: 0, dominantBaseline: "text-before-edge", fontSize: 12 }, text)
                ]
                : []),
            React.createElement(CalendarDay, { key: day, x: x, y: y + 20, rate: rate(value) })
        ];
    });
    return React.createElement("g", Object.assign({}, gprops), components);
};
export default Calendar;
