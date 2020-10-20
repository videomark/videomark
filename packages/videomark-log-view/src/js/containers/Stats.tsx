import React, { useContext, useState, useCallback } from "react";
// @ts-expect-error ts-migrate(7016) FIXME: Try `npm install @types/react-router` if it exists... Remove this comment to see the full error message
import { Redirect } from "react-router";
import Grid from "@material-ui/core/Grid";
import Box from "@material-ui/core/Box";
import Paper from "@material-ui/core/Paper";
import Typography from "@material-ui/core/Typography";
import Snackbar from "@material-ui/core/Snackbar";
import SnackbarContent from "@material-ui/core/SnackbarContent";
import Link from "@material-ui/core/Link";
import withWidth, { isWidthUp } from "@material-ui/core/withWidth";
import format from "date-fns/format";
import locale from "date-fns/locale/ja";
import { ResponsiveCalendarCanvas } from "@nivo/calendar";
import { ResponsiveBar } from "@nivo/bar";
import { ResponsiveScatterPlotCanvas } from "@nivo/scatterplot";
// @ts-expect-error ts-migrate(6142) FIXME: Module './ViewingsProvider' was resolved to '/home... Remove this comment to see the full error message
import { ViewingsContext } from "./ViewingsProvider";
// @ts-expect-error ts-migrate(6142) FIXME: Module './StatsDataProvider' was resolved to '/hom... Remove this comment to see the full error message
import { StatsDataContext } from "./StatsDataProvider";
// @ts-expect-error ts-migrate(6142) FIXME: Module './MiniStatsDownloadButton' was resolved to... Remove this comment to see the full error message
import { MiniStatsDownloadButton } from "./MiniStatsDownloadButton";
import videoPlatforms from "../utils/videoPlatforms";
import { gigaSizeFormat } from "../utils/Utils";
// @ts-expect-error ts-migrate(6142) FIXME: Module '../components/LoadingProgress' was resolve... Remove this comment to see the full error message
import LoadingProgress from "../components/LoadingProgress";

const timeFormatFromMinutes = (min: any) => `${
  min > 60 ? `${Math.floor(min / 60).toLocaleString()}時間` : ""
}${Math.floor(min % 60)}分`;
const timeFormat = (msec: any) => timeFormatFromMinutes(Math.floor(msec / 1e3 / 60));

const PlayingTimeStats = () => {
  const { initialState, length, playingTime, transferSize } = useContext(
    StatsDataContext
  );
  const sum = playingTime.reduce((a: any, c: any) => a + c.value, 0);
  const size = transferSize.reduce((a: any, c: any) => a + c.value, 0);
  const text = initialState ? (
    // @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
    <>
      ...
      {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
      <LoadingProgress />
    </>
  ) : (
    `${length.toLocaleString()}件 ${timeFormat(sum)} ${gigaSizeFormat(size)} GB`
  );
  return (
    // @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
    <Typography component="small" variant="caption">
      {text}
    </Typography>
  );
};
const PlayingTimeCalendar = () => {
  const { playingTime } = useContext(StatsDataContext);
  const data = (playingTime || []).map(({
    day,
    value
  }: any) => ({
    day,
    value: value / 1e3 / 60,
  }));
  const today = format(new Date(), "yyyy-MM-dd");
  return (
    // @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
    <Box m={0} component="figure">
      {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
      <Typography
        component="figcaption"
        variant="caption"
        color="textSecondary"
      >
        計測日
      </Typography>
      {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
      <Paper>
        {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
        <Box width="100%" height={240}>
          {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
          <ResponsiveCalendarCanvas
            data={data}
            from={today}
            to={today}
            monthLegend={(y, m) => format(new Date(y, m), "MMM", { locale })}
            // @ts-expect-error ts-migrate(2769) FIXME: Type '({ date, value: min }: PropsWithChildren<Cal... Remove this comment to see the full error message
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
              "#427162",
            ]}
            emptyColor="#eeeeee"
            dayBorderColor="#ffffff"
            legends={[
              {
                anchor: "bottom-right",
                direction: "row",
                itemCount: 3,
                itemWidth: 64,
                itemHeight: 32,
              },
            ]}
          />
        </Box>
        {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
        <Box position="relative">
          {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
          <Box position="absolute" right={120} bottom={8} fontSize={10}>
            再生時間 (分)
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};
const QoEStats = () => {
  const {
    qoeStats: { initialState, sum, count },
  } = useContext(StatsDataContext);
  const average = sum / count;
  // @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
  const caption = (text: any) => <Typography component="small" variant="caption">
    {text}
  </Typography>;
  if (initialState) return caption("...");
  return caption(
    Number.isFinite(average) ? `平均${average.toFixed(2)}` : "n/a"
  );
};
const QoETimelineChart = () => {
  const { qoeTimeline } = useContext(StatsDataContext);
  const serviceNames = new Map(
    videoPlatforms.map(({ id, name }) => [id, name])
  );
  const brandcolors = new Map(
    videoPlatforms.map(({ id, brandcolor }) => [id, brandcolor])
  );
  const limit = 200;
  return (
    // @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
    <Box m={0} component="figure">
      {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
      <Typography
        component="figcaption"
        variant="caption"
        color="textSecondary"
      >
        計測日時
      </Typography>
      {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
      <Paper>
        {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
        <Box width="100%" height={240}>
          {/* @ts-expect-error ts-migrate(2769) FIXME: Object literal may only specify known properties, ... Remove this comment to see the full error message */}
          <ResponsiveScatterPlotCanvas
            data={videoPlatforms.map(({ id }) => {
              const data = Array.isArray(qoeTimeline)
                ? qoeTimeline
                    .slice(-limit)
                    .filter(({ service }) => service === id)
                    .map(({ time, value }) => {
                      return {
                        x: new Date(time),
                        y: value,
                      };
                    })
                : [];
              return { id, data };
            })}
            xScale={{
              type: "time",
              min: "auto",
            }}
            yScale={{
              type: "linear",
              min: 1,
              max: 5,
            }}
            margin={{ top: 16, bottom: 32, left: 40, right: 40 }}
            colors={({ serieId }) => `${brandcolors.get(serieId)}40`}
            axisBottom={{
              tickSize: 0,
              // @ts-expect-error ts-migrate(2345) FIXME: Type 'string' is not assignable to type 'number | ... Remove this comment to see the full error message
              format: (date) => format(date, "M/d"),
            }}
            axisLeft={{
              tickSize: 0,
              // @ts-expect-error ts-migrate(2339) FIXME: Property 'toFixed' does not exist on type 'string'... Remove this comment to see the full error message
              format: (value) => value.toFixed(1),
              legend: "QoE",
              legendPosition: "middle",
              legendOffset: -32,
            }}
            tooltip={({
              node: {
                data: { serieId, x, y },
              },
            }) => (
              // @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
              <Box bgcolor="background.default">
                {`計測日時: ${x.toLocaleString(navigator.language, {
                  timeZoneName: "short",
                })}`}
                {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
                <br />
                {`QoE ${y.toFixed(2)} (${serviceNames.get(serieId)})`}
              </Box>
            )}
          />
        </Box>
      </Paper>
    </Box>
  );
};
// @ts-expect-error ts-migrate(2339) FIXME: Property 'width' does not exist on type 'PropsWith... Remove this comment to see the full error message
const QoEFrequencyBarChart = withWidth()(({ width }) => {
  const { qoeFrequency } = useContext(StatsDataContext);
  const serviceNames = new Map(
    videoPlatforms.map(({ id, name }) => [id, name])
  );
  const brandcolors = new Map(
    videoPlatforms.map(({ id, brandcolor }) => [id, brandcolor])
  );
  const data = Object.entries(qoeFrequency).map(([qoe, stats]) => ({
    // @ts-expect-error ts-migrate(2362) FIXME: The left-hand side of an arithmetic operation must... Remove this comment to see the full error message
    qoe: (qoe / 10).toFixed(1),
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'fromEntries' does not exist on type 'Obj... Remove this comment to see the full error message
    ...Object.fromEntries(
      // @ts-expect-error ts-migrate(2769) FIXME: Argument of type 'unknown' is not assignable to pa... Remove this comment to see the full error message
      Object.entries(stats).map(([service, value]) => [
        serviceNames.get(service),
        value,
      ])
    ),
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'fromEntries' does not exist on type 'Obj... Remove this comment to see the full error message
    ...Object.fromEntries(
      // @ts-expect-error ts-migrate(2769) FIXME: Argument of type 'unknown' is not assignable to pa... Remove this comment to see the full error message
      Object.entries(stats).map(([service]) => [
        `${serviceNames.get(service)}.brandcolor`,
        brandcolors.get(service),
      ])
    ),
  }));
  const tooltip = ({
    id,
    indexValue: qoe,
    value
  }: any) =>
    `QoE ${qoe}${
      qoe < 5 ? `以上${(Number(qoe) + 0.1).toFixed(1)}未満` : ""
    }: ${value.toLocaleString()}件 (${id})`;

  return (
    // @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
    <Box m={0} component="figure">
      {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
      <Typography
        component="figcaption"
        variant="caption"
        color="textSecondary"
      >
        計測数
      </Typography>
      {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
      <Paper>
        {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
        <Box width="100%" height={240}>
          {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
          <ResponsiveBar
            data={data}
            indexBy="qoe"
            minValue={0}
            margin={{
              top: 16,
              bottom: 32 + (isWidthUp("md", width) ? 16 : 0),
              left: 40,
              right: 24,
            }}
            keys={videoPlatforms.map(({ name }) => name)}
            colors={({ id, data: { [`${id}.brandcolor`]: color } }) => color}
            enableLabel={false}
            axisBottom={isWidthUp("md", width) ? { tickSize: 0 } : null}
            axisLeft={{
              tickSize: 0,
              format: (value) => value.toLocaleString(),
            }}
            legends={[
              {
                dataFrom: "keys",
                anchor: "top-left",
                translateX: 16,
                direction: "column",
                itemWidth: 80,
                itemHeight: 24,
              },
            ]}
            // @ts-expect-error ts-migrate(2769) FIXME: Type '({ id, indexValue: qoe, value }: any) => str... Remove this comment to see the full error message
            tooltip={tooltip}
          />
        </Box>
        {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
        <Box position="relative">
          {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
          <Box position="absolute" left="50%" bottom={8} fontSize={10}>
            QoE
          </Box>
          {isWidthUp("md", width) ? null : (
            // @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
            <Box position="absolute" right={16} bottom={8} fontSize={10}>
              5.0
            </Box>
          )}
        </Box>
      </Paper>
    </Box>
  );
});
const DeferLoadSnackbar = () => {
  const [open, setOpen] = useState(true);
  const { streamDefer } = useContext(StatsDataContext);
  const onClose = useCallback(() => setOpen(false), [setOpen]);
  const onClick = useCallback(() => {
    streamDefer.resolve();
    onClose();
  }, [streamDefer, onClose]);

  if (streamDefer == null) return null;

  const message = "計測件数が多いため、最近の結果のみ表示しています。";
  const action = (
    // @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
    // eslint-disable-next-line jsx-a11y/anchor-is-valid
    <Link component="button" onClick={onClick} color="inherit">
      全ての計測結果を解析する...
    </Link>
  );
  return (
    // @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
    <Snackbar open={open} onClose={onClose} variant="info">
      {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
      <SnackbarContent message={message} action={action} />
    </Snackbar>
  );
};

export default () => {
  const viewings = useContext(ViewingsContext);
  // @ts-expect-error ts-migrate(2571) FIXME: Object is of type 'unknown'.
  if (viewings !== undefined && viewings.size === 0) {
    // @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
    return <Redirect to="/welcome" />;
  }

  return (
    // @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
    <Box paddingTop={2}>
      {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
      <style>{`svg { display: block;}`}</style>
      {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
      <DeferLoadSnackbar />
      {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
      <Grid container spacing={2}>
        {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
        <Grid item xs={12}>
          {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
          <Grid item>
            {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
            <Typography component="h2" variant="h6">
              視聴時間
            </Typography>
            {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
            <PlayingTimeStats />
          </Grid>
          {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
          <Grid item xs={12}>
            {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
            <PlayingTimeCalendar />
          </Grid>
        </Grid>
        {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
        <Grid item xs={12} container justify="flex-end">
          {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
          <MiniStatsDownloadButton>
            計測結果を画像として保存
          </MiniStatsDownloadButton>
        </Grid>
        {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
        <Grid item xs={12}>
          {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
          <Grid item>
            {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
            <Typography component="h2" variant="h6">
              体感品質 (QoE)
            </Typography>
            {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
            <QoEStats />
          </Grid>
          {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
          <Grid item xs={12}>
            {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
            <Grid container spacing={1}>
              {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
              <Grid item xs={12}>
                {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
                <QoEFrequencyBarChart />
              </Grid>
              {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
              <Grid item xs={12}>
                {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
                <QoETimelineChart />
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
};
