import React, { useState, useCallback } from "react";
import PropTypes from "prop-types";
import { styled } from "@material-ui/styles";
import Container from "@material-ui/core/Container";
import Box from "@material-ui/core/Box";
import AppBar from "@material-ui/core/AppBar";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import IconButton from "@material-ui/core/IconButton";
import Close from "@material-ui/icons/Close";
import Paper from "@material-ui/core/Paper";
import MuiList from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import Divider from "@material-ui/core/Divider";
import Button from "@material-ui/core/Button";
import MuiDialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import uuidv4 from "uuid/v4";
import addYears from "date-fns/addYears";
import formatDistanceStrict from "date-fns/formatDistanceStrict";
import locale from "date-fns/locale/ja";
import useRouter from "./js/utils/useRouter";
import ThemeProvider from "./js/components/ThemeProvider";
import { clearStore } from "./js/containers/StatsDataProvider";
import { useSession, useSettings } from "./js/utils/ChromeExtensionWrapper";

const List = styled(MuiList)({
  padding: 0
});

const Header = () => {
  const { history } = useRouter();
  const close =
    history.length > 1 ? () => history.goBack() : () => window.close();

  return (
    <AppBar color="default">
      <Box
        height={48}
        component={Grid}
        container
        alignItems="center"
        justify="space-between"
      >
        <Grid item>
          <Box paddingLeft={6} />
        </Grid>
        <Grid item>
          <Typography component="h1" variant="h6">
            設定
          </Typography>
        </Grid>
        <Grid item>
          <IconButton color="primary" onClick={close}>
            <Close color="action" />
          </IconButton>
        </Grid>
      </Box>
    </AppBar>
  );
};

const Dialog = ({
  title,
  description,
  disagree,
  agree,
  open,
  onClose,
  onAgree
}) => (
  <MuiDialog open={open} onClose={onClose}>
    <DialogTitle>{title}</DialogTitle>
    <DialogContent>
      <DialogContentText>{description}</DialogContentText>
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose} color="primary">
        {disagree}
      </Button>
      <Button
        onClick={(...args) => {
          onAgree(...args);
          onClose(...args);
        }}
        color="secondary"
        autoFocus
      >
        {agree}
      </Button>
    </DialogActions>
  </MuiDialog>
);
Dialog.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  disagree: PropTypes.string.isRequired,
  agree: PropTypes.string.isRequired,
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onAgree: PropTypes.func.isRequired
};

const useDialog = () => {
  const [dialog, setDialog] = useState(null);
  const openDialog = useCallback(
    (type, handler) => {
      const onClose = () => {
        setDialog(null);
      };
      switch (type) {
        case "resetSession":
          return setDialog(
            <Dialog
              open
              title="セッションIDをリセットします"
              description="現在使われているセッションIDを削除し、新しいセッションIDを生成します。"
              disagree="キャンセル"
              agree="リセット"
              onClose={onClose}
              onAgree={handler}
            />
          );
        case "clearStatsCache":
          return setDialog(
            <Dialog
              open
              title="統計グラフのキャッシュを削除します"
              description="統計グラフのパフォーマンス改善のために使用されている一時データを削除します。"
              disagree="キャンセル"
              agree="削除"
              onClose={onClose}
              onAgree={handler}
            />
          );
        case "resetSettings":
          return setDialog(
            <Dialog
              open
              title="設定のリセット"
              description={[
                "セッションIDを削除し、設定を既定値にリセットします。",
                "統計グラフのキャッシュを削除します。",
                "ただし、計測結果とその履歴はそのまま残ります。"
              ].join("")}
              disagree="キャンセル"
              agree="リセット"
              onClose={onClose}
              onAgree={handler}
            />
          );
        default:
          return setDialog(null);
      }
    },
    [setDialog]
  );

  return [dialog, openDialog];
};

const PrivacySettings = ({ settings, session, saveSession }) => {
  const { expires_in: expiresIn } = settings === undefined ? {} : settings;
  const { id: sessionId } = session === undefined ? { id: "..." } : session;
  const [dialog, openDialog] = useDialog();
  const openResetSessionDialog = useCallback(
    () =>
      openDialog("resetSession", () =>
        saveSession({
          id: uuidv4(),
          expires: Date.now() + (Number.isFinite(expiresIn) ? expiresIn : 0)
        })
      ),
    [openDialog, saveSession, expiresIn]
  );
  const openStatsCacheDialog = useCallback(
    () => openDialog("clearStatsCache", () => clearStore()),
    [openDialog]
  );

  return (
    <Box marginY={4}>
      <Box marginY={1}>
        <Typography component="h3" variant="body1">
          プライバシー
        </Typography>
      </Box>
      <Paper>
        {dialog}
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
          <ListItem
            button
            onClick={openResetSessionDialog}
            disabled={sessionId === undefined}
          >
            <ListItemText primary="セッションIDのリセット" />
          </ListItem>
          <Divider component="li" />
          <ListItem button onClick={openStatsCacheDialog}>
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
  const [dialog, openDialog] = useDialog();
  const openResetSettingsDialog = useCallback(
    () => openDialog("resetSettings", () => resetSettings()),
    [openDialog]
  );
  return (
    <Box marginY={4}>
      <Box marginY={1}>
        <Typography component="h3" variant="body1">
          設定のリセット
        </Typography>
      </Box>
      <Paper>
        {dialog}
        <List>
          <ListItem
            button
            onClick={openResetSettingsDialog}
            disabled={settings === undefined}
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

const useOverwriteSessionId = ({
  settings,
  saveSettings,
  session,
  saveSession,
  searchParam
}) => {
  const { location } = useRouter();
  const searchParams = new URLSearchParams(location.search);
  const sessionId = searchParams.get(searchParam);

  if (
    session === undefined ||
    settings === undefined ||
    sessionId == null ||
    session.id === sessionId ||
    !/^[a-z0-9]+$/.test(sessionId)
  )
    return;

  const expiresIn = addYears(0, 10).getTime();

  saveSettings({ expires_in: expiresIn });
  saveSession({ id: sessionId, expires: Date.now() + expiresIn });
};

export default () => {
  const [settings, saveSettings] = useSettings();
  const [session, saveSession] = useSession();
  const resetSettings = useCallback(() => {
    saveSettings({});
    saveSession({});
    clearStore();
  }, [saveSettings, saveSession]);

  useOverwriteSessionId({
    settings,
    saveSettings,
    session,
    saveSession,
    searchParam: "session_id"
  });

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
