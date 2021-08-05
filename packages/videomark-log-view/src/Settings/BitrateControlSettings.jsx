import React, { useCallback } from "react";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/core/styles";
import Box from "@material-ui/core/Box";
import Divider from "@material-ui/core/Divider";
import Paper from "@material-ui/core/Paper";
import Typography from "@material-ui/core/Typography";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import Switch from "@material-ui/core/Switch";
import Slider from "@material-ui/core/Slider";
import Link from "@material-ui/core/Link";
import List from "./List";
import { useMobile } from "../js/utils/Utils";

const useStyles = makeStyles((theme) => ({
  slider: {
    paddingLeft: theme.spacing(4),
    paddingRight: theme.spacing(4),
  },
}));

const BitrateControlSettings = ({ settings, saveSettings }) => {
  const classes = useStyles();
  const resolutionMarks = [
    {
      value: 0,
      label: "144p",
      resolution: 144,
    },
    {
      value: 1,
      label: "240p",
      resolution: 240,
    },
    {
      value: 2,
      label: "360p",
      resolution: 360,
    },
    {
      value: 3,
      label: "480p",
      resolution: 480,
    },
    {
      value: 4,
      label: "720p",
      resolution: 720,
    },
    {
      value: 5,
      label: "1080p",
      resolution: 1080,
    },
    {
      value: 6,
      label: "1440p",
      resolution: 1440,
    },
    {
      value: 7,
      label: "2160p",
      resolution: 2160,
    },
  ];

  const bitrateMarks = [
    {
      value: 0,
      label: "128k",
      bitrate: 128 * 1024,
    },
    {
      value: 1,
      label: "256k",
      bitrate: 256 * 1024,
    },
    {
      value: 2,
      label: "512k",
      bitrate: 512 * 1024,
    },
    {
      value: 3,
      label: "1M",
      bitrate: 1024 * 1024,
    },
    {
      value: 4,
      label: "2.5M",
      bitrate: 2560 * 1024,
    },
    {
      value: 5,
      label: "5M",
      bitrate: 5120 * 1024,
    },
    {
      value: 6,
      label: "10M",
      bitrate: 10240 * 1024,
    },
    {
      value: 7,
      label: "20M",
      bitrate: 20480 * 1024,
    },
  ];

  const quotaMarks = [
    {
      value: 0,
      label: "1GB",
      quota: 1024,
    },
    {
      value: 1,
      label: "2GB",
      quota: 2 * 1024,
    },
    {
      value: 2,
      label: "3GB",
      quota: 3 * 1024,
    },
    {
      value: 3,
      label: "5GB",
      quota: 5 * 1024,
    },
    {
      value: 4,
      label: "7GB",
      quota: 7 * 1024,
    },
    {
      value: 5,
      label: "10GB",
      quota: 10 * 1024,
    },
    {
      value: 6,
      label: "20GB",
      quota: 20 * 1024,
    },
    {
      value: 7,
      label: "30GB",
      quota: 30 * 1024,
    },
  ];

  const {
    resolution_control: resolutionControl,
    bitrate_control: bitrateControl,
    resolution_control_enabled: resolutionControlEnabled,
    bitrate_control_enabled: bitrateControlEnabled,
    control_by_traffic_volume: controlByTrafficVolume,
    control_by_browser_quota: controlByBrowserQuota,
    browser_quota: browserQuota,
    browser_quota_bitrate: browserQuotaBitrate,
    peak_time_limit_enabled: peakTimeLimitEnabled,
  } = settings || {};

  const resolutionIndex = resolutionControl
    ? resolutionMarks.filter((mark) => mark.resolution <= resolutionControl)
        .length - 1
    : resolutionMarks.length - 1;
  const bitrateIndex = bitrateControl
    ? bitrateMarks.filter((mark) => mark.bitrate <= bitrateControl).length - 1
    : bitrateMarks.length - 1;
  const browserQuotaIndex = browserQuota
    ? quotaMarks.filter((mark) => mark.quota <= browserQuota).length - 1
    : quotaMarks.length - 1;
  const browserQuotaBitrateIndex = browserQuotaBitrate
    ? bitrateMarks.filter((mark) => mark.bitrate <= browserQuotaBitrate)
        .length - 1
    : bitrateMarks.length - 1;

  const onResolutionSliderChangeCommitted = useCallback(
    (event, value) => {
      saveSettings({
        ...settings,
        resolution_control: resolutionMarks[value].resolution,
      });
    },
    [settings, saveSettings]
  );
  const onBitrateSliderChangeCommitted = useCallback(
    (event, value) => {
      saveSettings({
        ...settings,
        bitrate_control: bitrateMarks[value].bitrate,
      });
    },
    [settings, saveSettings]
  );

  const onResolutionSwitchChange = useCallback(
    (event) => {
      saveSettings({
        ...settings,
        resolution_control_enabled: event.target.checked,
        resolution_control: resolutionMarks[resolutionIndex].resolution,
      });
    },
    [settings, saveSettings]
  );
  const onBitrateSwitchChange = useCallback(
    (event) => {
      saveSettings({
        ...settings,
        bitrate_control_enabled: event.target.checked,
        bitrate_control: bitrateMarks[bitrateIndex].bitrate,
      });
    },
    [settings, saveSettings]
  );

  const onBrowserQuotaSwitchChange = useCallback(
    (event) => {
      saveSettings({
        ...settings,
        control_by_traffic_volume: event.target.checked,
        control_by_browser_quota: event.target.checked,
        browser_quota: quotaMarks[browserQuotaIndex].quota,
        browser_quota_bitrate: bitrateMarks[browserQuotaBitrateIndex].bitrate,
      });
    },
    [settings, saveSettings]
  );

  const onBrowserQuotaSliderChangeCommitted = useCallback(
    (event, value) => {
      saveSettings({
        ...settings,
        browser_quota: quotaMarks[value].quota,
      });
    },
    [settings, saveSettings]
  );
  const onBrowserQuotaBitrateSliderChangeCommitted = useCallback(
    (event, value) => {
      saveSettings({
        ...settings,
        browser_quota_bitrate: bitrateMarks[value].bitrate,
      });
    },
    [settings, saveSettings]
  );

  const onPeakTimeLimitSwitchChange = useCallback(
    (event) => {
      saveSettings({
        ...settings,
        peak_time_limit_enabled: event.target.checked,
      });
    },
    [settings, saveSettings]
  );

  let resolutionSwitch;
  let bitrateSwitch;
  let resolutionSlider;
  let bitrateSlider;
  let browserQuotaSwitch;
  let browserQuotaSlider;
  let browserQuotaBitrateSlider;
  let peakTimeLimitSwitch;
  if (settings !== undefined) {
    resolutionSwitch = (
      <Switch
        checked={Boolean(resolutionControlEnabled)}
        onChange={onResolutionSwitchChange}
        value="resolution_control_enabled"
      />
    );
    bitrateSwitch = (
      <Switch
        checked={Boolean(bitrateControlEnabled)}
        onChange={onBitrateSwitchChange}
        value="bitrate_control_enabled"
      />
    );

    resolutionSlider = (
      <Slider
        disabled={!resolutionControlEnabled}
        defaultValue={resolutionIndex}
        marks={resolutionMarks}
        step={null}
        min={0}
        max={resolutionMarks.length - 1}
        onChangeCommitted={onResolutionSliderChangeCommitted}
        color="secondary"
      />
    );
    bitrateSlider = (
      <Slider
        disabled={!bitrateControlEnabled}
        defaultValue={bitrateIndex}
        marks={bitrateMarks}
        step={null}
        min={0}
        max={bitrateMarks.length - 1}
        onChangeCommitted={onBitrateSliderChangeCommitted}
        color="secondary"
      />
    );

    browserQuotaSwitch = (
      <Switch
        checked={Boolean(controlByBrowserQuota)}
        onChange={onBrowserQuotaSwitchChange}
        value="control_by_browser_quota"
      />
    );

    browserQuotaSlider = (
      <Slider
        disabled={!controlByTrafficVolume || !controlByBrowserQuota}
        defaultValue={browserQuotaIndex}
        marks={quotaMarks}
        step={null}
        min={0}
        max={quotaMarks.length - 1}
        onChangeCommitted={onBrowserQuotaSliderChangeCommitted}
        color="secondary"
      />
    );
    browserQuotaBitrateSlider = (
      <Slider
        disabled={!controlByTrafficVolume || !controlByBrowserQuota}
        defaultValue={browserQuotaBitrateIndex}
        marks={bitrateMarks}
        step={null}
        min={0}
        max={bitrateMarks.length - 1}
        onChangeCommitted={onBrowserQuotaBitrateSliderChangeCommitted}
        color="secondary"
      />
    );

    peakTimeLimitSwitch = (
      <Switch
        checked={Boolean(peakTimeLimitEnabled)}
        onChange={onPeakTimeLimitSwitchChange}
        value="peak_time_limit_enabled"
      />
    );
  }

  const mobile = useMobile();

  return (
    <Box marginY={4}>
      <Box marginY={1}>
        <Typography component="h3" variant="body1">
          ビットレート制限 (ベータ版)
        </Typography>
        <Typography color="textSecondary">
          {[
            "実験的な機能です。",
            mobile
              ? "現在、YouTubeとニコニコ動画のPC版サイトに対応しています。"
              : null,
            "設定変更後の動画再生開始時の制限値に応じてビットレート選択が行われます。",
          ].join("")}
          <Link href="https://vm.webdino.org/spec" color="secondary">
            ビットレート制限に対応しているサイト
          </Link>
          をご確認下さい。
        </Typography>
      </Box>
      <Paper>
        <List>
          <ListItem>
            <ListItemText primary="動画の解像度を制限する" />
            {resolutionSwitch}
          </ListItem>
          {resolutionControlEnabled && (
            <ListItem className={classes.slider}>{resolutionSlider}</ListItem>
          )}
          <Divider component="li" />
          <ListItem>
            <ListItemText primary="動画のビットレートを制限する" />
            {bitrateSwitch}
          </ListItem>
          {bitrateControlEnabled && (
            <ListItem className={classes.slider}>{bitrateSlider}</ListItem>
          )}
          <Divider component="li" />
          <ListItem>
            <ListItemText primary="月間の動画通信量が指定の値を超えたら制限する" />
            {browserQuotaSwitch}
          </ListItem>
          {controlByBrowserQuota && (
            <>
              <ListItem className={classes.slider}>
                {browserQuotaSlider}
              </ListItem>
              <ListItem>
                <ListItemText primary="通信量超過時のビットレート制限" />
              </ListItem>
              <ListItem className={classes.slider}>
                {browserQuotaBitrateSlider}
              </ListItem>
            </>
          )}
          <Divider component="li" />
          <ListItem>
            <ListItemText primary="ネットワークの混雑する時間帯にはビットレートを制限する" />
            {peakTimeLimitSwitch}
          </ListItem>
        </List>
      </Paper>
    </Box>
  );
};
BitrateControlSettings.propTypes = {
  settings: PropTypes.shape({ display_on_player: PropTypes.bool }),
  saveSettings: PropTypes.instanceOf(Function),
};
BitrateControlSettings.defaultProps = {
  settings: undefined,
  saveSettings: undefined,
};
export default BitrateControlSettings;
