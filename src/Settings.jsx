import React from "react";
import PropTypes from "prop-types";
import { styled } from "@material-ui/styles";
import Container from "@material-ui/core/Container";
import Box from "@material-ui/core/Box";
import AppBar from "@material-ui/core/AppBar";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import Paper from "@material-ui/core/Paper";
import MuiList from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import Divider from "@material-ui/core/Divider";
import uuidv4 from "uuid/v4";
import formatDistanceStrict from "date-fns/formatDistanceStrict";
import locale from "date-fns/locale/ja";
import ThemeProvider from "./js/components/ThemeProvider";
import { clearStore } from "./js/containers/StatsDataProvider";
import { useSession, useSettings } from "./js/utils/ChromeExtensionWrapper";

const List = styled(MuiList)({
  padding: 0
});

const Header = () => (
  <AppBar color="default">
    <Box
      height={48}
      component={Grid}
      container
      alignItems="center"
      justify="center"
    >
      <Grid item>
        <Typography component="h1" variant="h6">
          設定
        </Typography>
      </Grid>
    </Box>
  </AppBar>
);

const PrivacySettings = ({ settings, session, saveSession }) => {
  const { expires_in: expiresIn } = settings === undefined ? {} : settings;
  const { id: sessionId } = session === undefined ? { id: "..." } : session;
  const resetSession = () =>
    saveSession({
      id: uuidv4(),
      expires: Date.now() + (Number.isFinite(expiresIn) ? expiresIn : 0)
    });

  return (
    <Box marginY={4}>
      <Box marginY={1}>
        <Typography component="h3" variant="body1">
          プライバシー
        </Typography>
      </Box>
      <Paper>
        <List>
          <ListItem>
            <ListItemText
              primary="セッションID"
              secondary={sessionId === undefined ? "未設定" : sessionId}
            />
          </ListItem>
          <Divider component="li" />
          <ListItem>
            <ListItemText
              primary="セッション保持期間"
              secondary={
                expiresIn > 0
                  ? formatDistanceStrict(0, expiresIn, { unit: "day", locale })
                  : "新しいページを読み込むまで"
              }
            />
          </ListItem>
          <Divider component="li" />
          <ListItem button onClick={resetSession}>
            <ListItemText primary="セッションIDのリセット" />
          </ListItem>
          <Divider component="li" />
          <ListItem button onClick={() => clearStore()}>
            <ListItemText primary="統計グラフのキャッシュを削除" />
          </ListItem>
        </List>
      </Paper>
    </Box>
  );
};
PrivacySettings.propTypes = {
  settings: PropTypes.shape({}),
  session: PropTypes.shape({}),
  saveSession: PropTypes.instanceOf(Function)
};
PrivacySettings.defaultProps = {
  settings: undefined,
  session: undefined,
  saveSession: undefined
};

const Reset = ({ settings, resetSettings }) => {
  return (
    <Box marginY={4}>
      <Box marginY={1}>
        <Typography component="h3" variant="body1">
          設定のリセット
        </Typography>
      </Box>
      <Paper>
        <List>
          <ListItem
            button
            onClick={resetSettings}
            disabled={
              settings === undefined ? true : Object.keys(settings).length === 0
            }
          >
            <ListItemText primary="初期設定に戻す" />
          </ListItem>
        </List>
      </Paper>
    </Box>
  );
};
Reset.propTypes = {
  settings: PropTypes.shape({}),
  resetSettings: PropTypes.instanceOf(Function)
};
Reset.defaultProps = {
  settings: undefined,
  resetSettings: undefined
};

export default () => {
  const [settings, saveSettings] = useSettings();
  const [session, saveSession] = useSession();
  const resetSettings = () => saveSettings({});

  return (
    <ThemeProvider>
      <Header />
      <Box paddingTop={6}>
        <Container maxWidth="sm">
          <PrivacySettings
            settings={settings}
            saveSettings={saveSettings}
            session={session}
            saveSession={saveSession}
          />
          <Reset settings={settings} resetSettings={resetSettings} />
        </Container>
      </Box>
    </ThemeProvider>
  );
};
