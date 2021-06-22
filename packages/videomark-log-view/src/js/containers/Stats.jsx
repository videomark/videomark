import React, { useContext, useState, useCallback } from "react";
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
import { ViewingsContext } from "./ViewingsProvider";
import { StatsDataContext } from "./StatsDataProvider";
import { MiniStatsDownloadButton } from "./MiniStatsDownloadButton";
import videoPlatforms from "../utils/videoPlatforms";
import { gigaSizeFormat } from "../utils/Utils";
import LoadingProgress from "../components/LoadingProgress";
import { makeStyles, useTheme } from "@material-ui/core/styles";

const useStyles = makeStyles(() => ({
  chartLegend: {
    display: 'flex',
    justifyContent: 'center',
    flexWrap: 'wrap',
    margin: '16px 0',
    padding: '0',
    listStyle: 'none',
    whiteSpace: 'nowrap',
    '& li': {
      display: 'flex',
      alignItems: 'center',
      margin: '4px 8px',
      padding: '0',
      '& span': {
        display: 'block',
        margin: '0 8px 0 0',
        border: '1px solid #FFF6',
        borderRadius: '8px',
        width: '14px',
        height: '14px',
        content: '""',
      },
    },
  },
}));

const timeFormatFromMinutes = (min) =>
  `${
    min > 60 ? `${Math.floor(min / 60).toLocaleString()}時間` : ""
  }${Math.floor(min % 60)}分`;
const timeFormat = (msec) => timeFormatFromMinutes(Math.floor(msec / 1e3 / 60));

const PlayingTimeStats = () => {
  const { initialState, length, playingTime, transferSize } = useContext(
    StatsDataContext
  );
  const sum = playingTime.reduce((a, c) => a + c.value, 0);
  const size = transferSize.reduce((a, c) => a + c.value, 0);
  const text = initialState ? (
    <>
      ...
      <LoadingProgress />
    </>
  ) : (
    `${length.toLocaleString()}件 ${timeFormat(sum)} ${gigaSizeFormat(size)} GB`
  );
  return (
    <Typography component="small" variant="caption">
      {text}
    </Typography>
  );
};
const PlayingTimeCalendar = () => {
  const { palette } = useTheme();
  const { playingTime } = useContext(StatsDataContext);
  const data = (playingTime || []).map(({ day, value }) => ({
    day,
    value: value / 1e3 / 60,
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
      <Paper>
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
            theme={{
              background: palette.background.paper,
              textColor: palette.text.secondary,
              tooltip: {
                container: {
                  backgroundColor: palette.background.default,
                }
              },
            }}
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
            emptyColor={palette.action.disabledBackground}
            dayBorderColor={palette.background.paper}
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
        <Box position="relative">
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
  const caption = (text) => (
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
  const { palette } = useTheme();
  const { qoeTimeline } = useContext(StatsDataContext);
  const serviceNames = new Map(
    videoPlatforms.map(({ id, name }) => [id, name])
  );
  const brandcolors = new Map(
    videoPlatforms.map(({ id, brandcolor }) => [id, brandcolor])
  );
  const limit = 200;
  return (
    <Box m={0} component="figure">
      <Typography
        component="figcaption"
        variant="caption"
        color="textSecondary"
      >
        計測日時
      </Typography>
      <Paper>
        <Box width="100%" height={240}>
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
            theme={{
              background: palette.background.paper,
              textColor: palette.text.secondary,
              grid: {
                line: {
                  stroke: palette.divider,
                },
              },
              tooltip: {
                container: {
                  backgroundColor: palette.background.default,
                }
              }
            }}
            colors={({ serieId }) => `${brandcolors.get(serieId)}40`}
            axisBottom={{
              tickSize: 0,
              format: (date) => format(date, "M/d"),
            }}
            axisLeft={{
              tickSize: 0,
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
              <Box bgcolor="background.default">
                {`計測日時: ${x.toLocaleString(navigator.language, {
                  timeZoneName: "short",
                })}`}
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
const QoEFrequencyBarChart = withWidth()(({ width }) => {
  const { palette } = useTheme();
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
        value,
      ])
    ),
    ...Object.fromEntries(
      Object.entries(stats).map(([service]) => [
        `${serviceNames.get(service)}.brandcolor`,
        brandcolors.get(service),
      ])
    ),
  }));
  const tooltip = ({ id, indexValue: qoe, value }) =>
    `QoE ${qoe}${
      qoe < 5 ? `以上${(Number(qoe) + 0.1).toFixed(1)}未満` : ""
    }: ${value.toLocaleString()}件 (${id})`;

  return (
    <Box m={0} component="figure">
      <Typography
        component="figcaption"
        variant="caption"
        color="textSecondary"
      >
        計測数
      </Typography>
      <Paper>
        <Box width="100%" height={240}>
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
            theme={{
              background: palette.background.paper,
              textColor: palette.text.secondary,
              grid: {
                line: {
                  stroke: palette.divider,
                },
              },
              tooltip: {
                container: {
                  backgroundColor: palette.background.default,
                }
              },
            }}
            enableLabel={false}
            axisBottom={isWidthUp("md", width) ? { tickSize: 0 } : null}
            axisLeft={{
              tickSize: 0,
              format: (value) => value.toLocaleString(),
            }}
            tooltip={tooltip}
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
      </Paper>
    </Box>
  );
});

const QoEChartLegend = () => {
  const classes = useStyles();

  return (
    <Box>
      <ul className={classes.chartLegend} aria-label="グラフ凡例">
        {videoPlatforms.map(({ id, name, brandcolor }) => (
          <li key={id}>
            <span style={{ backgroundColor: brandcolor }}></span>
            {name}
          </li>
        ))}
      </ul>
    </Box>
  );
};

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
    // eslint-disable-next-line jsx-a11y/anchor-is-valid
    <Link component="button" onClick={onClick} color="inherit">
      全ての計測結果を解析する...
    </Link>
  );
  return (
    <Snackbar open={open} onClose={onClose} variant="info">
      <SnackbarContent message={message} action={action} />
    </Snackbar>
  );
};

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
        <Grid item xs={12} container justify="flex-end">
          <MiniStatsDownloadButton>
            計測結果を画像として保存
          </MiniStatsDownloadButton>
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
              <Grid item xs={12}>
                <QoEChartLegend />
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
};
