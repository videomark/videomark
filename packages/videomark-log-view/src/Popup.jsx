import React from "react";
import PropTypes from "prop-types";
import makeStyles from "@material-ui/core/styles/makeStyles";
import Container from "@material-ui/core/Container";
import Box from "@material-ui/core/Box";
import Button from "@material-ui/core/Button";
import EqualizerIcon from "@material-ui/icons/Equalizer";
import HistoryIcon from "@material-ui/icons/History";
import HelpIcon from "@material-ui/icons/Help";
import SettingsIcon from "@material-ui/icons/Settings";
import ThemeProvider from "./js/components/ThemeProvider";
import helpURL from "./js/utils/helpURL";
import QualityUiSetting from "./QualityUiSetting";
import logoLight from "./images/logo.png";
import logoDark from "./images/logo-invert.png";

// ポップアップウィンドウのサイズを調整
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

const LabeledIconButton = ({ href, icon, label }) => {
  const classes = useStyles();

  return (
    <Button
      className={classes.button}
      href={href}
      target="_blank"
      startIcon={React.createElement(icon)}
      onClick={() => {
        window.open(href);
        window.close();
      }}
    >
      {label}
    </Button>
  );
};
LabeledIconButton.propTypes = {
  href: PropTypes.string.isRequired,
  icon: PropTypes.instanceOf(Object).isRequired,
  label: PropTypes.string.isRequired,
};

export default () => {
  return (
    <ThemeProvider>
      <CSS />
      <Box paddingTop={2} component={Container}>
        <picture>
          <source srcSet={logoDark} media="(prefers-color-scheme: dark)" />
          <img src={logoLight} alt="Web VideoMark" />
        </picture>
        <Box marginTop={2}>
          <LabeledIconButton href="#/" icon={EqualizerIcon} label="測定結果" />
          <LabeledIconButton href="#/history" icon={HistoryIcon} label="履歴" />
          <LabeledIconButton href={helpURL} icon={HelpIcon} label="使い方" />
          <LabeledIconButton
            href="#/settings"
            icon={SettingsIcon}
            label="設定"
          />
        </Box>
        <QualityUiSetting />
      </Box>
    </ThemeProvider>
  );
};
