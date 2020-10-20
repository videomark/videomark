import React from "react";
import makeStyles from "@material-ui/core/styles/makeStyles";
import Container from "@material-ui/core/Container";
import Box from "@material-ui/core/Box";
import Button from "@material-ui/core/Button";
import EqualizerIcon from "@material-ui/icons/Equalizer";
import HistoryIcon from "@material-ui/icons/History";
import HelpIcon from "@material-ui/icons/Help";
import SettingsIcon from "@material-ui/icons/Settings";
// @ts-expect-error ts-migrate(6142) FIXME: Module './js/components/ThemeProvider' was resolve... Remove this comment to see the full error message
import ThemeProvider from "./js/components/ThemeProvider";
import helpURL from "./js/utils/helpURL";
// @ts-expect-error ts-migrate(6142) FIXME: Module './QualityUiSetting' was resolved to '/home... Remove this comment to see the full error message
import QualityUiSetting from "./QualityUiSetting";
// @ts-expect-error ts-migrate(2307) FIXME: Cannot find module './images/logo.png' or its corr... Remove this comment to see the full error message
import logo from "./images/logo.png";

// ポップアップウィンドウのサイズを調整
// @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
const CSS = () => <style>{`body{min-width:286px;}`}</style>;

const useStyles = makeStyles((theme) => {
  return {
    button: {
      justifyContent: "unset",
      width: "100%",
      paddingLeft: theme.spacing(2),
      "& .MuiButton-startIcon > *:first-child": {
        color: theme.palette.text.secondary,
        fontSize: theme.typography.h5.fontSize,
      },
      "& .MuiButton-label": {
        ...theme.typography.h6,
      },
    },
  };
});

type LabeledIconButtonProps = {
    href: string;
    icon: any; // TODO: PropTypes.instanceOf(Object)
    label: string;
};

const LabeledIconButton = ({ href, icon, label }: LabeledIconButtonProps) => {
  const classes = useStyles();

  return (
    // @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
    <Button
      className={classes.button}
      href={href}
      target="_blank"
      startIcon={React.createElement(icon)}
    >
      {label}
    </Button>
  );
};

export default () => {
  return (
    // @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
    <ThemeProvider>
      {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
      <CSS />
      {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
      <Box paddingTop={2} component={Container}>
        {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
        <img src={logo} alt="Web VideoMark" />
        {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
        <Box marginTop={2}>
          {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
          <LabeledIconButton href="#/" icon={EqualizerIcon} label="測定結果" />
          {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
          <LabeledIconButton href="#/history" icon={HistoryIcon} label="履歴" />
          {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
          <LabeledIconButton href={helpURL} icon={HelpIcon} label="使い方" />
          {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
          <LabeledIconButton
            href="#/settings"
            icon={SettingsIcon}
            label="設定"
          />
        </Box>
        {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
        <QualityUiSetting />
      </Box>
    </ThemeProvider>
  );
};
