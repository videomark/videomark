import React, { createContext, useContext, useState, useEffect } from "react";
import CssBaseline from "@material-ui/core/CssBaseline";
import Container from "@material-ui/core/Container";
import Grid from "@material-ui/core/Grid";
import Box from "@material-ui/core/Box";
import Card from "@material-ui/core/Card";
import Typography from "@material-ui/core/Typography";
import DataFrame from "dataframe-js";
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
import OfflineNoticeSnackbar from "./js/components/OfflineNoticeSnackbar";
import ChromeExtensionWrapper from "./js/utils/ChromeExtensionWrapper";
import ViewingModel from "./js/utils/Viewing";
import { urlToVideoPlatform } from "./js/utils/Utils";
import videoPlatforms from "./js/utils/videoPlatforms.json";

const loadViewings = async dispatch => {
  const viewings = (await new Promise(resolve => {
    ChromeExtensionWrapper.loadVideoIds(resolve);
  }))
    .map(
      ({
        id,
        data: {
          session_id: sessionId,
          video_id: videoId,
          start_time: startTime
        }
      }) => ({
        id,
        sessionId,
        videoId,
        startTime
      })
    )
    .sort(({ startTime: a }, { startTime: b }) => b - a)
    .map(({ sessionId, videoId }) => new ViewingModel({ sessionId, videoId }));
  const column = {
    id: await Promise.all(viewings.map(viewing => viewing.init()))
  };
  [
    column.startTime,
    column.location,
    column.qoe,
    column.quality
  ] = await Promise.all([
    Promise.all(viewings.map(viewing => viewing.startTime)),
    Promise.all(viewings.map(viewing => viewing.location)),
    Promise.all(viewings.map(viewing => viewing.qoe)),
    Promise.all(viewings.map(viewing => viewing.quality))
  ]);
  const serviceNames = new Map(
    videoPlatforms.map(({ id, name }) => [id, name])
  );
  const df = new DataFrame({
    ...column,
    qoe: column.qoe.map(value => (value >= 0 ? value : NaN))
  })
    .withColumn("service", row => urlToVideoPlatform(row.get("location")).id)
    .withColumn("serviceName", row => serviceNames.get(row.get("service")))
    .withColumn("date", row => format(row.get("startTime"), "yyyy-MM-dd"))
    .withColumn("endTime", row => (row.get("quality") || {}).date)
    .withColumn("pause", row => ((row.get("quality") || {}).timing || {}).pause)
    .withColumn(
      "playing",
      row => row.get("endTime") - row.get("startTime") - row.get("pause")
    );
  const stats = Object.fromEntries(
    df
      .listColumns()
      .filter(
        key =>
          !(
            key === "id" ||
            key === "location" ||
            key === "service" ||
            key === "serviceName" ||
            key === "date" ||
            key === "quality"
          )
      )
      .map(key => [
        key,
        {
          ...df.stat.stats(key),
          count: df.dropMissingValues([key]).count()
        }
      ])
  );
  dispatch({
    stats,
    playingTime: df
      .dropMissingValues(["playing"])
      .groupBy("date")
      .aggregate(group => group.stat.sum("playing"))
      .toArray()
      .map(([date, playingTime]) => ({ day: date, value: playingTime })),
    qoeTimeline: df
      .select("service", "startTime", "qoe")
      .dropMissingValues(["service", "startTime", "qoe"])
      .toArray()
      .map(([service, startTime, qoe]) => ({
        service,
        time: startTime.getTime(),
        value: qoe
      })),
    qoeFrequency: df
      .select("serviceName", "qoe")
      .dropMissingValues(["serviceName", "qoe"])
      .map(row => row.set("qoe", Math.ceil(row.get("qoe"))))
      .groupBy("qoe")
      .aggregate(group =>
        Object.fromEntries(
          group
            .groupBy("serviceName")
            .aggregate(serviceGroup => serviceGroup.count())
            .toArray()
        )
      )
      .toArray()
      .map(([qoe, serviceStats]) => ({ qoe, ...serviceStats }))
  });
};
const DataContext = createContext();
const DataProvider = props => {
  const [data, setData] = useState();
  useEffect(() => {
    if (data === undefined) loadViewings(setData);
  }, [setData]);
  return (
    <DataContext.Provider {...props} value={data === undefined ? {} : data} />
  );
};
const PlayingTimeStats = () => {
  const { stats } = useContext(DataContext);
  const { count, sum } = (stats || {}).playing || {};
  const text = [count, sum].every(Number.isFinite)
    ? `${count}件 ${formatDistance(0, sum, {
        locale
      })}`
    : "...";
  return (
    <Typography component="small" variant="caption">
      {text}
    </Typography>
  );
};
const PlayingTimeCalendar = () => {
  const { playingTime } = useContext(DataContext);
  const data = (playingTime || [{ day: format(new Date(), "yyyy-dd-MM") }]).map(
    ({ day, value }) => ({
      day,
      value: Number.isFinite(value) ? value / 1e3 / 60 : NaN
    })
  );
  const lastDate = data.slice(-1)[0].day;
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
            from={lastDate}
            to={lastDate}
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
                itemCount: 4,
                itemWidth: 24,
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
  const { stats } = useContext(DataContext);
  const { mean } = (stats || {}).qoe || {};
  const text = Number.isFinite(mean) ? `平均 ${mean.toFixed(2)}` : "...";
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
                ? qoeTimeline.filter(({ service }) => service === id)
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
  const data = Array.isArray(qoeFrequency)
    ? [...Array(5).keys()].map(i => ({
        ...(qoeFrequency.find(({ qoe }) => qoe === i + 1) || {}),
        qoe: `QoE ${i}〜${i + 1}`
      }))
    : [];
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
            colors={videoPlatforms.map(({ brandcolor }) => brandcolor)}
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

export default () => (
  <DataProvider>
    <Container>
      <CssBaseline />
      <style>{`svg { display: block;}`}</style>
      <Grid container justify="center" spacing={2}>
        <Grid item xs={12}>
          <Typography component="h1" variant="h6" align="center">
            計測結果
          </Typography>
        </Grid>
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
      <OfflineNoticeSnackbar />
    </Container>
  </DataProvider>
);
