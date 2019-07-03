import React, { useContext } from "react";
import { Redirect } from "react-router";
import Grid from "@material-ui/core/Grid";
import Box from "@material-ui/core/Box";
import Card from "@material-ui/core/Card";
import Typography from "@material-ui/core/Typography";
import { format, formatDistance, formatDistanceStrict } from "date-fns";
import locale from "date-fns/locale/ja";
import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from "recharts";
import { Calendar } from "@nivo/calendar";
import { Bar } from "@nivo/bar";
import { DataContext } from "./StatsDataProvider";
import videoPlatforms from "../utils/videoPlatforms.json";

const PlayingTimeStats = () => {
  const { initialState, length, playingTime } = useContext(DataContext);
  const sum = playingTime.map(({ value }) => value).reduce((a, c) => a + c, 0);
  const text = initialState
    ? "..."
    : `${length}件 ${formatDistance(0, sum, {
        locale
      })}`;
  return (
    <Typography component="small" variant="caption">
      {text}
    </Typography>
  );
};
const PlayingTimeCalendar = () => {
  const { playingTime } = useContext(DataContext);
  const data = (playingTime || []).map(({ day, value }) => ({
    day,
    value: value / 1e3 / 60
  }));
  const today = format(new Date(), "yyyy-MM-dd");
  return (
    <Box m={0} component="figure">
      <Typography
        component="figcaption"
        variant="caption"
        color="textSecondary"
      >
        計測日時と再生時間 (分)
      </Typography>
      <Card>
        <ResponsiveContainer width="100%" aspect={3} maxHeight={240}>
          <Calendar
            data={data}
            from={today}
            to={today}
            monthLegend={(y, m) => format(new Date(y, m), "MMM", { locale })}
            tooltip={({ date, value: min }) => {
              const msec = min * 60 * 1e3;
              const duration = formatDistance(0, msec, {
                locale
              });
              const strictDuration = formatDistanceStrict(0, msec, {
                unit: "minute",
                locale
              });
              return [
                `${new Intl.DateTimeFormat(navigator.language).format(date)}:`,
                duration,
                strictDuration === duration ? "" : `(${strictDuration})`
              ].join(" ");
            }}
            margin={{ bottom: 8, left: 32, right: 32 }}
            colors={[
              "#ebf6f3",
              "#d7eee7",
              "#c3e6db",
              "#b0decf",
              "#9cd6c3",
              "#88ceb7",
              "#75c6ac",
              "#64A993",
              "#538D7A",
              "#427162"
            ]}
            emptyColor="#eeeeee"
            dayBorderColor="#ffffff"
            monthBorderColor="#ffffff"
            monthBorderWidth={4}
            legends={[
              {
                anchor: "bottom-right",
                direction: "row",
                itemCount: 3,
                itemWidth: 64,
                itemHeight: 32
              }
            ]}
          />
        </ResponsiveContainer>
      </Card>
    </Box>
  );
};
const QoEStats = () => {
  const {
    qoeStats: { sum, count }
  } = useContext(DataContext);
  const average = sum / count;
  const text = Number.isFinite(average) ? `平均 ${average.toFixed(2)}` : "...";
  return (
    <Typography component="small" variant="caption">
      {text}
    </Typography>
  );
};
const QoETimelineChart = () => {
  const { qoeTimeline } = useContext(DataContext);
  return (
    <Box m={0} component="figure">
      <Typography
        component="figcaption"
        variant="caption"
        color="textSecondary"
      >
        計測日時
      </Typography>
      <Card>
        <ResponsiveContainer width="100%" aspect={2}>
          <ScatterChart margin={{ top: 16, left: -16, right: 32 }}>
            <CartesianGrid />
            <XAxis
              name="計測日時"
              dataKey="time"
              type="number"
              scale="time"
              domain={["dataMin", "dataMax"]}
              tickLine={false}
              tickFormatter={time =>
                Number.isFinite(time)
                  ? new Intl.DateTimeFormat().format(new Date(time))
                  : ""
              }
            />
            <YAxis
              name="QoE"
              dataKey="value"
              label={{ value: "QoE", angle: -90 }}
              width={56}
              domain={[0, 5]}
              ticks={[...Array(5).keys(), 5]}
              tick={{ fill: "#000000", angle: -90 }}
              tickLine={false}
            />
            {videoPlatforms.map(({ id, brandcolor }) => {
              const data = Array.isArray(qoeTimeline)
                ? qoeTimeline
                    .slice(-120)
                    .filter(({ service }) => service === id)
                : [];
              return (
                <Scatter
                  key={id}
                  data={data}
                  fill={brandcolor}
                  fillOpacity={0.25}
                />
              );
            })}
            <Tooltip
              formatter={(value, name) => {
                switch (name) {
                  case "計測日時":
                    return new Date(value).toLocaleString(navigator.language, {
                      timeZoneName: "short"
                    });
                  default:
                    return value.toFixed(2);
                }
              }}
            />
          </ScatterChart>
        </ResponsiveContainer>
      </Card>
    </Box>
  );
};
const QoEFrequencyBarChart = () => {
  const { qoeFrequency } = useContext(DataContext);
  const serviceNames = new Map(
    videoPlatforms.map(({ id, name }) => [id, name])
  );
  const brandcolors = new Map(
    videoPlatforms.map(({ id, brandcolor }) => [id, brandcolor])
  );
  const data = [...qoeFrequency].map(([qoe, stats]) => ({
    qoe: `QoE ${qoe - 1}〜${qoe}`,
    ...Object.fromEntries(
      [...stats].map(([service, value]) => [serviceNames.get(service), value])
    ),
    ...Object.fromEntries(
      [...stats].map(([service]) => [
        `${serviceNames.get(service)}.brandcolor`,
        brandcolors.get(service)
      ])
    )
  }));
  return (
    <Box m={0} component="figure">
      <Typography
        component="figcaption"
        variant="caption"
        color="textSecondary"
      >
        計測数
      </Typography>
      <Card>
        <ResponsiveContainer width="100%" aspect={2}>
          <Bar
            data={data}
            indexBy="qoe"
            minValue={0}
            margin={{ top: 16, bottom: 32, left: 24, right: 24 }}
            keys={videoPlatforms.map(({ name }) => name)}
            colors={({ id, data: { [`${id}.brandcolor`]: color } }) => color}
            labelTextColor="#ffffff"
            layout="horizontal"
            enableGridX
            axisBottom={{ tickSize: 0 }}
            enableGridY={false}
            axisLeft={null}
            legends={[
              {
                dataFrom: "keys",
                anchor: "bottom-right",
                direction: "column",
                itemWidth: 80,
                itemHeight: 24
              }
            ]}
            tooltip={({ id, indexValue, value }) =>
              `${indexValue}: ${value}件 (${id})`
            }
          />
        </ResponsiveContainer>
      </Card>
    </Box>
  );
};

export default () => {
  const { initialState, length } = useContext(DataContext);
  if (!initialState && length === 0) {
    return <Redirect to="/welcome" />;
  }

  return (
    <Box paddingTop={2}>
      <style>{`svg { display: block;}`}</style>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Grid item>
            <Typography component="h2" variant="h6">
              視聴時間
            </Typography>
            <PlayingTimeStats />
          </Grid>
          <Grid item xs={12}>
            <PlayingTimeCalendar />
          </Grid>
        </Grid>
        <Grid item xs={12}>
          <Grid item>
            <Typography component="h2" variant="h6">
              体感品質 (QoE)
            </Typography>
            <QoEStats />
          </Grid>
          <Grid item xs={12}>
            <Grid container spacing={1}>
              <Grid item xs={12} sm={6}>
                <QoETimelineChart />
              </Grid>
              <Grid item xs={12} sm={6}>
                <QoEFrequencyBarChart />
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
};
