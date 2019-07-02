import React, { createContext, useContext, useReducer, useEffect } from "react";
import { Redirect } from "react-router";
import Grid from "@material-ui/core/Grid";
import Box from "@material-ui/core/Box";
import Card from "@material-ui/core/Card";
import Typography from "@material-ui/core/Typography";
import DataFrame from "dataframe-js";
import { format, formatDistance, formatDistanceStrict } from "date-fns";
import locale from "date-fns/locale/ja";
import {
  ResponsiveContainer
  // ScatterChart,
  // Scatter,
  // XAxis,
  // YAxis,
  // Tooltip,
  // CartesianGrid
} from "recharts";
import { Calendar } from "@nivo/calendar";
// import { Bar } from "@nivo/bar";
import ChromeExtensionWrapper from "../utils/ChromeExtensionWrapper";
import ViewingModel from "../utils/Viewing";
import { urlToVideoPlatform } from "../utils/Utils";
import videoPlatforms from "../utils/videoPlatforms.json";

const viewingsStream = new ReadableStream({
  async start() {
    this.ids = (await new Promise(resolve => {
      ChromeExtensionWrapper.loadVideoIds(resolve);
    }))
      .map(
        ({
          data: {
            session_id: sessionId,
            video_id: videoId,
            start_time: startTime
          }
        }) => ({
          sessionId,
          videoId,
          startTime
        })
      )
      .sort(({ startTime: a }, { startTime: b }) => a - b);
  },
  async pull(controller) {
    if (this.ids.length === 0) return;
    const buffer = this.ids.splice(-10).map(id => new ViewingModel(id));
    await Promise.all(buffer.map(viewing => viewing.init()));
    const column = {};
    [
      column.startTime,
      column.location,
      // column.qoe,
      column.quality
    ] = await Promise.all([
      Promise.all(buffer.map(viewing => viewing.startTime)),
      Promise.all(buffer.map(viewing => viewing.location)),
      // Promise.all(buffer.map(viewing => viewing.qoe)),
      Promise.all(buffer.map(viewing => viewing.quality))
    ]);
    // column.qoe = column.qoe.map(value => (value >= 0 ? value : NaN))
    const serviceNames = new Map(
      videoPlatforms.map(({ id, name }) => [id, name])
    );
    column.service = column.location.map(
      location => urlToVideoPlatform(location).id
    );
    column.serviceName = column.service.map(service =>
      serviceNames.get(service)
    );
    column.date = column.startTime.map(startTime =>
      format(startTime, "yyyy-MM-dd")
    );
    const df = new DataFrame(column).withColumn("playing", row => {
      const { date: endTime, timing } = row.get("quality");
      const { pause } = timing || {};
      const playing = endTime - row.get("startTime") - pause;
      return Number.isFinite(playing) ? playing : 0;
    });
    controller.enqueue({
      length: buffer.length,
      playingTime: df
        .groupBy("date")
        .aggregate(group => group.stat.sum("playing"))
        .toArray()
        .map(([date, playingTime]) => ({ day: date, value: playingTime }))
      // qoeTimeline: df
      //   .select("service", "startTime", "qoe")
      //   .dropMissingValues(["service", "startTime", "qoe"])
      //   .toArray()
      //   .map(([service, startTime, qoe]) => ({
      //     service,
      //     time: startTime.getTime(),
      //     value: qoe
      //   })),
      // qoeFrequency: df
      //   .select("serviceName", "qoe")
      //   .dropMissingValues(["serviceName", "qoe"])
      //   .map(row => row.set("qoe", Math.ceil(row.get("qoe"))))
      //   .groupBy("qoe")
      //   .aggregate(group =>
      //     Object.fromEntries(
      //       group
      //         .groupBy("serviceName")
      //         .aggregate(serviceGroup => serviceGroup.count())
      //         .toArray()
      //     )
      //   )
      //   .toArray()
      //   .map(([qoe, serviceStats]) => ({ qoe, ...serviceStats }))
    });
    await new Promise(resolve => setTimeout(resolve, 100));
  }
});
const initialData = {
  initialState: true,
  length: 0,
  playingTime: []
};
const reducer = (data, chunk) => ({
  initialState: false,
  length: chunk.length + data.length,
  playingTime: ((current, past) => {
    if (
      current.length > 0 &&
      past.length > 0 &&
      current[0].day === past.slice(-1)[0].day
    )
      return [
        ...past.slice(0, -1),
        {
          ...current[0],
          value: current[0].value + past.slice(-1)[0].value
        },
        ...current.slice(1)
      ];
    return [...past, ...current];
  })(data.playingTime, chunk.playingTime)
});
const dispatcher = f =>
  new WritableStream({
    write: chunk => f(chunk)
  });

const DataContext = createContext();
const DataProvider = props => {
  const [data, addData] = useReducer(reducer, initialData);
  useEffect(() => {
    if (data.initialState) {
      viewingsStream.pipeTo(dispatcher(addData));
    }
  }, [addData]);
  if (!data.initialState && data.length === 0) {
    return <Redirect to="/welcome" />;
  }
  return (
    <DataContext.Provider {...props} value={data === undefined ? {} : data} />
  );
};
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
// const QoEStats = () => {
//   const { stats } = useContext(DataContext);
//   const { mean } = (stats || {}).qoe || {};
//   const text = Number.isFinite(mean) ? `平均 ${mean.toFixed(2)}` : "...";
//   return (
//     <Typography component="small" variant="caption">
//       {text}
//     </Typography>
//   );
// };
// const QoETimelineChart = () => {
//   const { qoeTimeline } = useContext(DataContext);
//   return (
//     <Box m={0} component="figure">
//       <Typography
//         component="figcaption"
//         variant="caption"
//         color="textSecondary"
//       >
//         計測日時
//       </Typography>
//       <Card>
//         <ResponsiveContainer width="100%" aspect={2}>
//           <ScatterChart margin={{ top: 16, left: -16, right: 32 }}>
//             <CartesianGrid />
//             <XAxis
//               name="計測日時"
//               dataKey="time"
//               type="number"
//               scale="time"
//               domain={["dataMin", "dataMax"]}
//               tickLine={false}
//               tickFormatter={time =>
//                 Number.isFinite(time)
//                   ? new Intl.DateTimeFormat().format(new Date(time))
//                   : ""
//               }
//             />
//             <YAxis
//               name="QoE"
//               dataKey="value"
//               label={{ value: "QoE", angle: -90 }}
//               width={56}
//               domain={[0, 5]}
//               ticks={[...Array(5).keys(), 5]}
//               tick={{ fill: "#000000", angle: -90 }}
//               tickLine={false}
//             />
//             {videoPlatforms.map(({ id, brandcolor }) => {
//               const data = Array.isArray(qoeTimeline)
//                 ? qoeTimeline.filter(({ service }) => service === id)
//                 : [];
//               return (
//                 <Scatter
//                   key={id}
//                   data={data}
//                   fill={brandcolor}
//                   fillOpacity={0.25}
//                 />
//               );
//             })}
//             <Tooltip
//               formatter={(value, name) => {
//                 switch (name) {
//                   case "計測日時":
//                     return new Date(value).toLocaleString(navigator.language, {
//                       timeZoneName: "short"
//                     });
//                   default:
//                     return value.toFixed(2);
//                 }
//               }}
//             />
//           </ScatterChart>
//         </ResponsiveContainer>
//       </Card>
//     </Box>
//   );
// };
// const QoEFrequencyBarChart = () => {
//   const { qoeFrequency } = useContext(DataContext);
//   const data = Array.isArray(qoeFrequency)
//     ? [...Array(5).keys()].map(i => ({
//         ...(qoeFrequency.find(({ qoe }) => qoe === i + 1) || {}),
//         qoe: `QoE ${i}〜${i + 1}`
//       }))
//     : [];
//   return (
//     <Box m={0} component="figure">
//       <Typography
//         component="figcaption"
//         variant="caption"
//         color="textSecondary"
//       >
//         計測数
//       </Typography>
//       <Card>
//         <ResponsiveContainer width="100%" aspect={2}>
//           <Bar
//             data={data}
//             indexBy="qoe"
//             minValue={0}
//             margin={{ top: 16, bottom: 32, left: 24, right: 24 }}
//             keys={videoPlatforms.map(({ name }) => name)}
//             colors={videoPlatforms.map(({ brandcolor }) => brandcolor)}
//             labelTextColor="#ffffff"
//             layout="horizontal"
//             enableGridX
//             axisBottom={{ tickSize: 0 }}
//             enableGridY={false}
//             axisLeft={null}
//             legends={[
//               {
//                 dataFrom: "keys",
//                 anchor: "bottom-right",
//                 direction: "column",
//                 itemWidth: 80,
//                 itemHeight: 24
//               }
//             ]}
//             tooltip={({ id, indexValue, value }) =>
//               `${indexValue}: ${value}件 (${id})`
//             }
//           />
//         </ResponsiveContainer>
//       </Card>
//     </Box>
//   );
// };

export default () => (
  <DataProvider>
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
        {/* <Grid item xs={12}>
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
        </Grid> */}
      </Grid>
    </Box>
  </DataProvider>
);
