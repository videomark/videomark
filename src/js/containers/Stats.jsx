import fromEntries from "object.fromentries";
import React, { useContext, useState } from "react";
import { Redirect } from "react-router";
import { withRouter, Link as RouterLink } from "react-router-dom";
import Grid from "@material-ui/core/Grid";
import Box from "@material-ui/core/Box";
import Card from "@material-ui/core/Card";
import Typography from "@material-ui/core/Typography";
import Snackbar from "@material-ui/core/Snackbar";
import SnackbarContent from "@material-ui/core/SnackbarContent";
import Link from "@material-ui/core/Link";
import withWidth, { isWidthUp } from "@material-ui/core/withWidth";
import format from "date-fns/format";
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
import { ResponsiveCalendarCanvas } from "@nivo/calendar";
import { ResponsiveBar } from "@nivo/bar";
import { ViewingsContext, STREAM_BUFFER_SIZE } from "./ViewingsProvider";
import { StatsDataContext } from "./StatsDataProvider";
import videoPlatforms from "../utils/videoPlatforms.json";
import LoadingProgress from "../components/LoadingProgress";

// FIXME: for chrome version < 73
if (!Object.fromEntries) fromEntries.shim();

const timeFormatFromMinutes = min =>
  `${
    min > 60 ? `${Math.floor(min / 60).toLocaleString()}時間` : ""
  }${Math.floor(min % 60)}分`;
const timeFormat = msec => timeFormatFromMinutes(Math.floor(msec / 1e3 / 60));

const PlayingTimeStats = () => {
  const { initialState, length, playingTime } = useContext(StatsDataContext);
  const sum = playingTime.map(({ value }) => value).reduce((a, c) => a + c, 0);
  const text = initialState ? (
    <>
      ...
      <LoadingProgress />
    </>
  ) : (
    `${length.toLocaleString()}件 ${timeFormat(sum)}`
  );
  return (
    <Typography component="small" variant="caption">
      {text}
    </Typography>
  );
};
const PlayingTimeCalendar = () => {
  const { playingTime } = useContext(StatsDataContext);
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
        計測日
      </Typography>
      <Card>
        <Box width="100%" height={240}>
          <ResponsiveCalendarCanvas
            data={data}
            from={today}
            to={today}
            monthLegend={(y, m) => format(new Date(y, m), "MMM", { locale })}
            tooltip={({ date, value: min }) => {
              return `${new Intl.DateTimeFormat(navigator.language).format(
                date
              )}: ${timeFormatFromMinutes(min)}`;
            }}
            margin={{ bottom: 16, left: 32, right: 32 }}
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
        </Box>
        <Box position="relative">
          <Box position="absolute" right={120} bottom={8} fontSize={10}>
            再生時間 (分)
          </Box>
        </Box>
      </Card>
    </Box>
  );
};
const QoEStats = () => {
  const {
    qoeStats: { initialState, sum, count }
  } = useContext(StatsDataContext);
  const average = sum / count;
  const caption = text => (
    <Typography component="small" variant="caption">
      {text}
    </Typography>
  );
  if (initialState) return caption("...");
  return caption(
    Number.isFinite(average) ? `平均${average.toFixed(2)}` : "n/a"
  );
};
const QoETimelineChart = () => {
  const { qoeTimeline } = useContext(StatsDataContext);
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
        <ResponsiveContainer width="100%" height={240}>
          <ScatterChart margin={{ top: 16, left: -16, right: 32 }}>
            <CartesianGrid />
            <XAxis
              name="計測日時"
              dataKey="time"
              type="number"
              scale="time"
              domain={[dataMin => dataMin - 600e3, dataMax => dataMax + 600e3]}
              tickLine={false}
              tickFormatter={time =>
                format(new Date(time), "MMMd日", { locale })
              }
            />
            <YAxis
              name="QoE"
              dataKey="value"
              label={{ value: "QoE", angle: -90 }}
              width={56}
              domain={[1, 5]}
              ticks={[...Array(5).keys()].map(i => i + 1)}
              tick={{ fill: "#000000", angle: -90 }}
              tickLine={false}
            />
            {videoPlatforms.map(({ id, brandcolor }) => {
              const data = Array.isArray(qoeTimeline)
                ? qoeTimeline
                    .slice(-STREAM_BUFFER_SIZE)
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
const QoEFrequencyBarChart = withWidth()(({ width }) => {
  const { qoeFrequency } = useContext(StatsDataContext);
  const serviceNames = new Map(
    videoPlatforms.map(({ id, name }) => [id, name])
  );
  const brandcolors = new Map(
    videoPlatforms.map(({ id, brandcolor }) => [id, brandcolor])
  );
  const data = Object.entries(qoeFrequency).map(([qoe, stats]) => ({
    qoe: (qoe / 10).toFixed(1),
    ...Object.fromEntries(
      Object.entries(stats).map(([service, value]) => [
        serviceNames.get(service),
        value
      ])
    ),
    ...Object.fromEntries(
      Object.entries(stats).map(([service]) => [
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
        <Box width="100%" height={240}>
          <ResponsiveBar
            data={data}
            indexBy="qoe"
            minValue={0}
            margin={{
              top: 16,
              bottom: 32 + (isWidthUp("md", width) ? 16 : 0),
              left: 40,
              right: 24
            }}
            keys={videoPlatforms.map(({ name }) => name)}
            colors={({ id, data: { [`${id}.brandcolor`]: color } }) => color}
            enableLabel={false}
            axisBottom={isWidthUp("md", width) ? { tickSize: 0 } : null}
            axisLeft={{
              tickSize: 0,
              format: value => value.toLocaleString()
            }}
            legends={[
              {
                dataFrom: "keys",
                anchor: "top-left",
                translateX: 16,
                direction: "column",
                itemWidth: 80,
                itemHeight: 24
              }
            ]}
            tooltip={({ id, indexValue: qoe, value }) =>
              `QoE ${qoe}${
                qoe < 5 ? `以上${(Number(qoe) + 0.1).toFixed(1)}未満` : ""
              }: ${value.toLocaleString()}件 (${id})`
            }
          />
        </Box>
        <Box position="relative">
          <Box position="absolute" left="50%" bottom={8} fontSize={10}>
            QoE
          </Box>
          {isWidthUp("md", width) ? null : (
            <Box position="absolute" right={16} bottom={8} fontSize={10}>
              5.0
            </Box>
          )}
        </Box>
      </Card>
    </Box>
  );
});
const DeferLoadSnackbar = withRouter(({ location }) => {
  const [open, setOpen] = useState(true);
  const { streamDefer } = useContext(StatsDataContext);
  if (streamDefer === undefined) return null;
  if (new URLSearchParams(location.search).has("all")) {
    streamDefer.resolve();
    return null;
  }
  const onClose = () => setOpen(false);
  const message = "計測件数が多いため、最近の結果のみ表示しています。";
  const action = (
    <Link component={RouterLink} to={{ search: "all" }} color="inherit">
      全ての計測結果を解析する...
    </Link>
  );
  return (
    <Snackbar open={open} onClose={onClose} variant="info">
      <SnackbarContent message={message} action={action} />
    </Snackbar>
  );
});

export default () => {
  const viewings = useContext(ViewingsContext);
  if (viewings !== undefined && viewings.size === 0) {
    return <Redirect to="/welcome" />;
  }

  return (
    <Box paddingTop={2}>
      <style>{`svg { display: block;}`}</style>
      <DeferLoadSnackbar />
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
              <Grid item xs={12}>
                <QoEFrequencyBarChart />
              </Grid>
              <Grid item xs={12}>
                <QoETimelineChart />
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
};
