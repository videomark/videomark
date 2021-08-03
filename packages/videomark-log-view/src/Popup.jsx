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
const CSS = () => <style>{`body{margin:16px;width:216px;}`}</style>;

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
    logo: {
      "& img": {
        display: "block",
        margin: "24px auto",
        width: 200,
        verticalAlign: "top",
      },
    },
  };
});

const LabeledIconButton = ({ href, icon, label }) => {
  const classes = useStyles();

  return (
    <Button
      className={classes.button}
      startIcon={React.createElement(icon)}
      onClick={async () => {
        const url = href instanceof URL ? href : new URL(href, location.href);
        // 既にタブが開かれていないか確認、ただし URL のハッシュ部分は無視する
        const [existingTab] = await new Promise((resolve) => {
          chrome.tabs.query({ url: `${url.origin}${url.pathname}` }, (tabs) => resolve(tabs));
        });

        if (existingTab) {
          // 既にタブが開かれていればそのタブを選択し、同一 URL (ハッシュ) でなければページを切り替え
          chrome.tabs.update(existingTab.id, {
            active: true,
            url: existingTab.url !== url.href ? url.href : undefined,
          });
        } else {
          chrome.tabs.create({ url: url.href });
        }

        // Firefox ではポップアップを明示的に閉じる必要がある
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
  const classes = useStyles();

  return (
    <ThemeProvider>
      <CSS />
      <Box padding={0} component={Container}>
        <picture className={classes.logo}>
          <source srcSet={logoDark} media="(prefers-color-scheme: dark)" />
          <img src={logoLight} alt="Web VideoMark" />
        </picture>
        <Box marginTop={2}>
          <LabeledIconButton href="#/" icon={EqualizerIcon} label="計測結果" />
          <LabeledIconButton href="#/history" icon={HistoryIcon} label="履歴" />
          <LabeledIconButton
            href="#/settings"
            icon={SettingsIcon}
            label="設定"
          />
          <LabeledIconButton href={helpURL} icon={HelpIcon} label="使い方" />
        </Box>
        <QualityUiSetting />
      </Box>
    </ThemeProvider>
  );
};

// コンテキストメニューを無効化
window.addEventListener('contextmenu', (event) => event.preventDefault());
