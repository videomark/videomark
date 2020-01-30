import React from "react";
import PropTypes from "prop-types";
import { styled } from "@material-ui/styles";
import { makeStyles } from "@material-ui/core/styles";
import Box from "@material-ui/core/Box";
import Divider from "@material-ui/core/Divider";
import Paper from "@material-ui/core/Paper";
import Typography from "@material-ui/core/Typography";
import MuiList from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import Checkbox from "@material-ui/core/Checkbox";
import Slider from "@material-ui/core/Slider";
import TextField from "@material-ui/core/TextField";

const List = styled(MuiList)({
  padding: 0
});

const BitrateControlSettings = ({ settings, saveSettings }) => {
  const useStyles = makeStyles(theme => ({
    nested6: {
      paddingLeft: theme.spacing(6)
    },
    nested12: {
      paddingLeft: theme.spacing(12)
    },
    slider: {
      paddingLeft: theme.spacing(4),
      paddingRight: theme.spacing(4)
    }
  }));
  const classes = useStyles();

  const resolutionMarks = [
    {
      value: 0,
      label: "144p",
      resolution: 144
    },
    {
      value: 1,
      label: "240p",
      resolution: 240
    },
    {
      value: 2,
      label: "360p",
      resolution: 360
    },
    {
      value: 3,
      label: "480p",
      resolution: 480
    },
    {
      value: 4,
      label: "720p",
      resolution: 720
    },
    {
      value: 5,
      label: "1080p",
      resolution: 1080
    },
    {
      value: 6,
      label: "1440p",
      resolution: 1440
    },
    {
      value: 7,
      label: "2160p",
      resolution: 2160
    }
  ];

  const bitrateMarks = [
    {
      value: 0,
      label: "128k",
      bitrate: 128 * 1024
    },
    {
      value: 1,
      label: "256k",
      bitrate: 256 * 1024
    },
    {
      value: 2,
      label: "512k",
      bitrate: 512 * 1024
    },
    {
      value: 3,
      label: "1M",
      bitrate: 1024 * 1024
    },
    {
      value: 4,
      label: "2.5M",
      bitrate: 2560 * 1024
    },
    {
      value: 5,
      label: "5M",
      bitrate: 5120 * 1024
    },
    {
      value: 6,
      label: "10M",
      bitrate: 10240 * 1024
    },
    {
      value: 7,
      label: "20M",
      bitrate: 20480 * 1024
    }
  ];

  const {
    resolution_control: resolutionControl,
    bitrate_control: bitrateControl,
    resolution_control_enabled: resolutionControlEnabled,
    bitrate_control_enabled: bitrateControlEnabled,
    control_by_traffic_volume: controlByTrafficVolume,
    control_by_os_quota: controlByOsQuota,
    control_by_browser_quota: controlByBrowserQuota,
    browser_quota: browserQuota,
    browser_quota_bitrate: browserQuotaBitrate
  } = settings || {};

  const [state, setState] = React.useState({
    resolution_control_enabled: false,
    bitrate_control_enabled: false,
    control_by_traffic_volume: false,
    control_by_os_quota: false,
    control_by_browser_quota: false
  });

  function onResolutionSliderChangeCommitted(event, value) {
    saveSettings(
      Object.assign(settings, {
        resolution_control: resolutionMarks[value].resolution
      })
    );
  }
  function onBitrateSliderChangeCommitted(event, value) {
    saveSettings(
      Object.assign(settings, {
        bitrate_control: bitrateMarks[value].bitrate
      })
    );
  }

  function onResolutionCheckboxChange(event) {
    setState({ ...state, resolution_control_enabled: event.target.checked });
    saveSettings(
      Object.assign(settings, {
        resolution_control_enabled: event.target.checked
      })
    );
    if (!resolutionControl)
      onResolutionSliderChangeCommitted(null, resolutionMarks.length - 1);
  }
  function onBitrateCheckboxChange(event) {
    setState({ ...state, bitrate_control_enabled: event.target.checked });
    saveSettings(
      Object.assign(settings, {
        bitrate_control_enabled: event.target.checked
      })
    );
    if (!bitrateControl)
      onBitrateSliderChangeCommitted(null, bitrateMarks.length - 1);
  }

  function onTrafficVolumeCheckboxChange(event) {
    setState({ ...state, control_by_traffic_volume: event.target.checked });
    saveSettings(
      Object.assign(settings, {
        control_by_traffic_volume: event.target.checked
      })
    );
  }
  function onOsQuotaCheckboxChange(event) {
    setState({ ...state, control_by_os_quota: event.target.checked });
    saveSettings(
      Object.assign(settings, {
        control_by_os_quota: event.target.checked
      })
    );
  }
  function onBrowserQuotaCheckboxChange(event) {
    setState({ ...state, control_by_browser_quota: event.target.checked });
    saveSettings(
      Object.assign(settings, {
        control_by_browser_quota: event.target.checked
      })
    );
  }

  function onBrowserQuotaTextFieldChange(event) {
    saveSettings(
      Object.assign(settings, {
        browser_quota: parseInt(event.target.value, 10)
      })
    );
  }
  function onBrowserQuotaBitrateTextFieldChange(event) {
    saveSettings(
      Object.assign(settings, {
        browser_quota_bitrate: parseInt(event.target.value, 10)
      })
    );
  }

  let resolutionCheckbox;
  let bitrateCheckbox;
  let resolutionSlider;
  let bitrateSlider;
  let trafficVolumeCheckbox;
  let osQuotaCheckbox;
  let browserQuotaCheckbox;
  let browserQuotaTextField;
  let browserQuotaBitrateTextField;
  if (settings !== undefined) {
    const resolutionIndex = resolutionControl
      ? resolutionMarks.filter(mark => mark.resolution <= resolutionControl)
          .length - 1
      : resolutionMarks.length - 1;
    const bitrateIndex = bitrateControl
      ? bitrateMarks.filter(mark => mark.bitrate <= bitrateControl).length - 1
      : bitrateMarks.length - 1;

    resolutionCheckbox = (
      <Checkbox
        checked={resolutionControlEnabled}
        value="resolution_control_enabled"
        onChange={onResolutionCheckboxChange}
        color="primary"
      />
    );
    bitrateCheckbox = (
      <Checkbox
        checked={bitrateControlEnabled}
        value="bitrate_control_enabled"
        onChange={onBitrateCheckboxChange}
        color="primary"
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
      />
    );

    trafficVolumeCheckbox = (
      <Checkbox
        checked={controlByTrafficVolume}
        value="control_by_traffic_volume"
        onChange={onTrafficVolumeCheckboxChange}
        color="primary"
      />
    );
    osQuotaCheckbox = (
      <Checkbox
        checked={controlByOsQuota}
        value="control_by_os_quota"
        onChange={onOsQuotaCheckboxChange}
        disabled={!controlByTrafficVolume}
        color="primary"
      />
    );
    browserQuotaCheckbox = (
      <Checkbox
        checked={controlByBrowserQuota}
        value="control_by_browser_quota"
        onChange={onBrowserQuotaCheckboxChange}
        disabled={!controlByTrafficVolume}
        color="primary"
      />
    );

    browserQuotaTextField = (
      <TextField
        type="number"
        inputProps={{ min: 1, style: { textAlign: "right" } }}
        defaultValue={browserQuota}
        disabled={!controlByTrafficVolume || !controlByBrowserQuota}
        onChange={onBrowserQuotaTextFieldChange}
      />
    );
    browserQuotaBitrateTextField = (
      <TextField
        type="number"
        inputProps={{ min: 1, style: { textAlign: "right" } }}
        defaultValue={browserQuotaBitrate}
        disabled={!controlByTrafficVolume}
        onChange={onBrowserQuotaBitrateTextFieldChange}
      />
    );
  }

  return (
    <Box marginY={4}>
      <Box marginY={1}>
        <Typography component="h3" variant="body1">
          ビットレート制御
        </Typography>
      </Box>
      <Paper>
        <List>
          <ListItem>
            {resolutionCheckbox}
            <ListItemText primary="動画の解像度制御を行う" />
          </ListItem>
          <ListItem className={classes.slider}>{resolutionSlider}</ListItem>
          <Divider component="li" />
          <ListItem>
            {bitrateCheckbox}
            <ListItemText primary="動画のビットレート制御を行う" />
          </ListItem>
          <ListItem className={classes.slider}>{bitrateSlider}</ListItem>
          <Divider component="li" />
          <ListItem>
            {trafficVolumeCheckbox}
            <ListItemText primary="通信量に応じて動画のビットレート制御を行う" />
          </ListItem>
          <ListItem className={classes.nested6}>
            {osQuotaCheckbox}
            <ListItemText primary="OS 全体の通信量が OS 設定の警告値を超えたら制限する" />
          </ListItem>
          <ListItem className={classes.nested6}>
            {browserQuotaCheckbox}
            <ListItemText primary="VM Browser の動画通信量が指定の値を超えたら制限する" />
          </ListItem>
          <ListItem className={classes.nested12}>
            月間
            {browserQuotaTextField}
            MB
          </ListItem>
          <ListItem className={classes.nested6}>
            <ListItemText primary="VM Browser の動画通信量が指定の値を超えたら制限する" />
          </ListItem>
          <ListItem className={classes.nested6}>
            上限
            {browserQuotaBitrateTextField}
            kbps
          </ListItem>
        </List>
      </Paper>
    </Box>
  );
};
BitrateControlSettings.propTypes = {
  settings: PropTypes.shape({ display_on_player: PropTypes.bool }),
  saveSettings: PropTypes.instanceOf(Function)
};
BitrateControlSettings.defaultProps = {
  settings: undefined,
  saveSettings: undefined
};
export default BitrateControlSettings;
