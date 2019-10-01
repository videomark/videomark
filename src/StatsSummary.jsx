import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/core/styles";
import CssBaseline from "@material-ui/core/CssBaseline";
import Container from "@material-ui/core/Container";
import Box from "@material-ui/core/Box";
import Paper from "@material-ui/core/Paper";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import IconButton from "@material-ui/core/IconButton";
import TextField from "@material-ui/core/TextField";
import InputAdornment from "@material-ui/core/InputAdornment";
import Clear from "@material-ui/icons/Clear";
import ChevronRight from "@material-ui/icons/ChevronRight";
import ChevronLeft from "@material-ui/icons/ChevronLeft";
import FirstPage from "@material-ui/icons/FirstPage";
import LastPage from "@material-ui/icons/LastPage";
import Search from "@material-ui/icons/Search";
import Send from "@material-ui/icons/Send";
import Refresh from "@material-ui/icons/Refresh";
import SaveAlt from "@material-ui/icons/SaveAlt";
import MaterialTable from "material-table";
import Country from "./js/utils/Country";
import Subdivision from "./js/utils/Subdivision";
import videoPlatforms from "./js/utils/videoPlatforms.json";
import OfflineNoticeSnackbar from "./js/components/OfflineNoticeSnackbar";

const useStyles = makeStyles(theme => ({
  root: {
    padding: theme.spacing(2)
  },
  code: {
    fontSize: 12
  }
}));
const Stats = ({ title, type }) => {
  const classes = useStyles();
  const baseUrl = new URL("https://sodium.webdino.org:8443/");
  const days = "日月火水木金土";
  const daysOrder = ({ day: a }, { day: b }) =>
    days.indexOf(a) - days.indexOf(b);
  const column = {
    index: { title: "#", field: "index" },
    hour: { title: "時間 (時)", field: "hour" },
    day: {
      title: "曜日",
      field: "day",
      customSort: daysOrder
    },
    service: { title: "サービス", field: "service" },
    isp: { title: "ISP", field: "isp" }
  };
  const types = [
    {
      id: "hour",
      url: new URL("/stats", baseUrl),
      body: {
        group: "hour",
        limit: 24
      },
      columns: [column.hour]
    },
    {
      id: "day",
      url: new URL("/stats", baseUrl),
      body: {
        group: "day"
      },
      columns: [column.day],
      mapper: body =>
        body.map(a => ({
          ...a,
          day: days[a.day]
        }))
    },
    {
      id: "country",
      url: new URL("/stats", baseUrl),
      body: {
        group: "country",
        sort: { count: -1 }
      },
      index: true,
      columns: [{ title: "国", field: "country" }],
      mapper: body =>
        body.map(a => ({ ...a, country: Country.codeToName(a.country) }))
    },
    {
      id: "jp-subdivision",
      url: new URL("/stats", baseUrl),
      body: {
        group: "subdivision",
        country: "JP",
        sort: { count: -1 },
        limit: 100 // FIXME: country で指定したもの以外も含まれるため多めに取得
      },
      index: true,
      columns: [{ title: "地域 (日本)", field: "jp-subdivision" }],
      mapper: body =>
        body
          .filter(
            a =>
              a.country === "JP" &&
              Subdivision.codeToName(Number(a.subdivision)) !== undefined
          )
          .map(a => ({
            ...a,
            "jp-subdivision": Subdivision.codeToName(Number(a.subdivision))
          }))
    },
    {
      id: "service",
      url: new URL("/stats", baseUrl),
      body: {
        group: "service",
        sort: { count: -1 }
      },
      internal: true,
      index: true,
      columns: [column.service],
      mapper: body =>
        body
          .filter(a => videoPlatforms.some(vp => vp.id === a.service))
          .map(a => ({
            ...a,
            service: videoPlatforms.find(vp => vp.id === a.service).name
          }))
    },
    {
      id: "service-hour",
      internal: true,
      url: new URL("/stats/service", baseUrl),
      body: {
        group: "hour"
      },
      columns: [column.hour, column.service],
      mapper: body =>
        body
          .filter(a => videoPlatforms.some(vp => vp.id === a.service))
          .flatMap(a =>
            a.data.map(b => ({
              ...b,
              service: videoPlatforms.find(vp => vp.id === a.service).name
            }))
          )
          .sort(({ hour: a }, { hour: b }) => a - b)
    },
    {
      id: "service-day",
      url: new URL("/stats/service", baseUrl),
      body: {
        group: "day"
      },
      internal: true,
      columns: [column.day, column.service],
      mapper: body =>
        body
          .filter(a => videoPlatforms.some(vp => vp.id === a.service))
          .flatMap(a =>
            a.data.map(b => ({
              ...b,
              service: videoPlatforms.find(vp => vp.id === a.service).name,
              day: days[b.day]
            }))
          )
          .sort(daysOrder)
    },
    {
      id: "isp",
      url: new URL("/stats", baseUrl),
      body: {
        group: "isp",
        sort: { count: -1 },
        limit: 100
      },
      internal: true,
      index: true,
      columns: [column.isp]
    },
    {
      id: "isp-hour",
      url: new URL("/stats/isp", baseUrl),
      body: {
        group: "hour",
        sort: { count: -1 },
        limit: 100
      },
      internal: true,
      columns: [column.hour, column.isp],
      mapper: body =>
        body
          .flatMap(a => a.data.map(b => ({ ...b, isp: a.isp })))
          .sort(({ hour: a }, { hour: b }) => a - b)
    },
    {
      id: "isp-day",
      url: new URL("/stats/isp", baseUrl),
      body: {
        group: "day",
        sort: { count: -1 },
        limit: 100
      },
      internal: true,
      columns: [column.day, column.isp],
      mapper: body =>
        body
          .flatMap(a =>
            a.data.map(b => ({
              ...b,
              isp: a.isp,
              day: days[b.day]
            }))
          )
          .sort(daysOrder)
    }
  ];

  const {
    url,
    body,
    internal = false,
    index = false,
    columns = [],
    mapper = a => a
  } = types.find(g => g.id === type);
  const [resBody, setResBody] = useState();
  const data = resBody === undefined ? [] : mapper(resBody);
  const [apiKey, setApiKey] = useState("");
  const request = async dispatch => {
    const reqUrl = new URL(url);
    if (internal && apiKey.length > 0) {
      const s = new URLSearchParams();
      s.set("pass", apiKey);
      reqUrl.search = s;
    }
    const reqBody = JSON.stringify(body);
    const res = await fetch(reqUrl, {
      method: "post",
      headers: {
        "Content-Type": "application/json"
      },
      body: reqBody
    });
    dispatch(await res.json());
  };
  useEffect(() => {
    if (!internal) request(setResBody);
  }, []);

  const styledColumns = [
    ...(index ? [column.index] : []),
    ...columns,
    { title: "件数", field: "count", type: "numeric" },
    { title: "QoE (平均)", field: "average", type: "numeric" }
  ].map(c => ({
    ...c,
    headerStyle: { padding: 0 },
    cellStyle: { padding: 0 }
  }));
  const formattedData = data.map((a, i) => ({
    index: i + 1,
    ...a,
    average: Number(a.average).toFixed(2)
  }));

  return (
    <Paper className={classes.root}>
      {resBody === undefined ? (
        <Typography component="h2" variant="h6">
          {title}
        </Typography>
      ) : (
        <MaterialTable
          title={title}
          columns={styledColumns}
          components={{ Container: props => <div {...props} /> }} // eslint-disable-line react/jsx-props-no-spreading
          data={formattedData}
          options={{
            sorting: true,
            exportButton: internal,
            rowStyle: { height: 49 },
            pageSize: 10,
            pageSizeOptions: ((opts, rows) => {
              const i = opts.findIndex(n => rows <= n);
              return opts.slice(0, i >= 0 ? i + 1 : opts.length);
            })([10, 25, 50, 75, 100], data.length)
          }}
          icons={{
            Clear,
            FirstPage,
            LastPage,
            NextPage: ChevronRight,
            PreviousPage: ChevronLeft,
            ResetSearch: Clear,
            Search,
            Export: SaveAlt
          }}
        />
      )}
      {internal ? (
        <form
          action=""
          onSubmit={async e => {
            e.preventDefault();
            await request(setResBody);
          }}
        >
          <TextField
            label="APIキー"
            type="password"
            autoComplete="current-password"
            onChange={e => setApiKey(e.target.value)}
            required
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton type="submit">
                    <Send />
                  </IconButton>
                </InputAdornment>
              )
            }}
          />
        </form>
      ) : null}
      <Grid container justify="space-between">
        <Grid item>
          <Box component="details" mt={1.5}>
            <Typography component="summary" varient="caption">
              リクエスト詳細
            </Typography>
            <>
              <Typography component="h5" varient="caption">
                URL
              </Typography>
              <code className={classes.code}>{url.toString()}</code>
            </>
            {body === undefined ? null : (
              <>
                <Typography component="h5" variant="caption">
                  Body
                </Typography>
                <pre className={classes.code}>
                  {JSON.stringify(body, null, "  ")}
                </pre>
              </>
            )}
            {resBody === undefined ? null : (
              <>
                <Typography component="h5" variant="caption">
                  Response Body
                </Typography>
                <pre className={classes.code}>
                  {JSON.stringify(resBody, null, "  ")}
                </pre>
              </>
            )}
          </Box>
        </Grid>
        {resBody === undefined ? null : (
          <Grid item>
            <IconButton
              onClick={async () => {
                setResBody();
                await request(setResBody);
              }}
            >
              <Refresh fontSize="small" />
            </IconButton>
          </Grid>
        )}
      </Grid>
    </Paper>
  );
};
Stats.propTypes = {
  title: PropTypes.string.isRequired,
  type: PropTypes.oneOf([
    "hour",
    "day",
    "country",
    "jp-subdivision",
    "service",
    "service-hour",
    "service-day",
    "isp",
    "isp-hour",
    "isp-day"
  ]).isRequired
};

export default () => {
  return (
    <Container>
      <CssBaseline />
      <Grid container justify="center" spacing={2}>
        <Grid item>
          <Typography component="h1" variant="h5" align="center">
            統計API
          </Typography>
        </Grid>
        <Grid item container spacing={1}>
          {[
            { type: "hour", title: "時間帯" },
            { type: "day", title: "曜日" },
            { type: "country", title: "国" },
            { type: "jp-subdivision", title: "地域" }
          ].map(stats => (
            <Grid key={stats.type} item xs={12} sm={6}>
              {/* eslint-disable-next-line react/jsx-props-no-spreading */}
              <Stats {...stats} />
            </Grid>
          ))}
        </Grid>
        <Grid item>
          <Typography component="h2" variant="h6" align="center">
            動画配信サービス
          </Typography>
        </Grid>
        <Grid item container spacing={1}>
          {[
            { type: "service-hour", title: "時間帯" },
            { type: "service-day", title: "曜日" },
            { type: "service", title: "全体" }
          ].map(stats => (
            <Grid key={stats.type} item xs={12} sm>
              {/* eslint-disable-next-line react/jsx-props-no-spreading */}
              <Stats {...stats} />
            </Grid>
          ))}
        </Grid>
        <Grid item>
          <Typography component="h2" variant="h6" align="center">
            プロバイダ
          </Typography>
        </Grid>
        <Grid item container spacing={1}>
          {[
            { type: "isp-hour", title: "時間帯" },
            { type: "isp-day", title: "曜日" },
            { type: "isp", title: "全体" }
          ].map(stats => (
            <Grid key={stats.type} item xs={12} sm>
              {/* eslint-disable-next-line react/jsx-props-no-spreading */}
              <Stats {...stats} />
            </Grid>
          ))}
        </Grid>
      </Grid>
      <OfflineNoticeSnackbar />
    </Container>
  );
};
