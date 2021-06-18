import React, { useState, useCallback } from "react";
import PropTypes from "prop-types";
import makeStyles from "@material-ui/core/styles/makeStyles";
import Box from "@material-ui/core/Box";
import Typography from "@material-ui/core/Typography";
import Paper from "@material-ui/core/Paper";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import Slider from "@material-ui/core/Slider";
import ArrowRight from "@material-ui/icons/ArrowRight";
import Divider from "@material-ui/core/Divider";
import { v4 as uuidv4 } from "uuid";
import addDays from "date-fns/addDays";
import formatDistanceStrict from "date-fns/formatDistanceStrict";
import locale from "date-fns/locale/ja";
import List from "./List";
import Dialog from "./Dialog";
import PersonalSessionSettingItem from "./PersonalSessionSettingItem";
import {
  clearStore as clearStatsCache,
  getStoredIndex as getStatsCacheIndex,
} from "../js/containers/StatsDataProvider";
import { clearViewings } from "../js/utils/ChromeExtensionWrapper";

/** デフォルトのセッション保持期間 */
const defaultSessionExpiresIn = addDays(0, 30).getTime(); // うるう秒は考慮しない

/** セッション保持期間一覧 */
const sessionExpiresInMarks = [
  0,
  addDays(0, 1).getTime(),
  defaultSessionExpiresIn,
  addDays(0, 365).getTime(),
].map((expiresIn, value) => ({
  value,
  label:
    expiresIn > 0
      ? formatDistanceStrict(0, expiresIn, {
          unit: "day",
          locale,
        })
      : "0",
  expiresIn,
}));

/**
 * @param {number} expiresIn セッション保持期間
 * @returns {number}
 */
const sessionExpiresInToValue = (expiresIn) =>
  (
    sessionExpiresInMarks.find((mark) => mark.expiresIn === expiresIn) ??
    sessionExpiresInMarks[sessionExpiresInMarks.length - 1]
  ).value;

const useStyle = makeStyles((theme) => ({
  sessionExpiresIn: {
    "& .MuiSlider-root": {
      marginLeft: theme.spacing(1),
      marginRight: theme.spacing(2),
    },
    "& > *": {
      flex: 1,
    },
  },
}));

const SessionExpiresIn = ({ expiresIn, onChange }) => {
  const classes = useStyle();
  return (
    <ListItem className={classes.sessionExpiresIn}>
      <ListItemText
        primary="セッション保持期間"
        secondary={
          expiresIn > 0
            ? formatDistanceStrict(0, expiresIn, { unit: "day", locale })
            : "新しいページを読み込むまで"
        }
      />
      <Slider
        color="secondary"
        marks={sessionExpiresInMarks}
        max={sessionExpiresInMarks.length - 1}
        value={sessionExpiresInToValue(expiresIn)}
        onChange={(_, value) => {
          onChange(sessionExpiresInMarks[value].expiresIn);
        }}
      />
    </ListItem>
  );
};
SessionExpiresIn.propTypes = {
  expiresIn: PropTypes.number,
  onChange: PropTypes.instanceOf(Function).isRequired,
};
SessionExpiresIn.defaultProps = {
  expiresIn: defaultSessionExpiresIn,
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
        case "clearViewings":
          return setDialog(
            <Dialog
              open
              title="計測履歴を削除します"
              description={[
                "計測履歴と統計グラフのキャッシュを削除します。",
                "ただし、サーバーに保存されているデータは残ります。",
              ].join("")}
              disagree="キャンセル"
              agree="削除"
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
        default:
          return setDialog(null);
      }
    },
    [setDialog]
  );

  return [dialog, openDialog];
};

const PrivacySettings = ({ settings, saveSettings, session, saveSession }) => {
  const { id: sessionId } = session || {};
  const { expires_in: expiresIn } = settings || {};
  const updateSessionExpiresIn = useCallback(
    (ms) => {
      saveSettings({ ...settings, expires_in: ms });
      saveSession({ ...session, expires: Date.now() + ms });
    },
    [settings, saveSettings, session, saveSession]
  );

  const [dialog, openDialog] = useDialog();
  const openResetSessionDialog = useCallback(
    () =>
      openDialog("resetSession", () =>
        saveSession({
          id: uuidv4(),
          expires:
            Date.now() +
            (Number.isFinite(expiresIn) ? expiresIn : defaultSessionExpiresIn),
        })
      ),
    [openDialog, saveSession, expiresIn]
  );
  const openClearViewingsDialog = useCallback(
    () =>
      openDialog("clearViewings", () => {
        clearStatsCache();
        clearViewings();
      }),
    [openDialog]
  );
  const openStatsCacheDialog = useCallback(
    () => openDialog("clearStatsCache", () => clearStatsCache()),
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
          <PersonalSessionSettingItem
            settings={settings}
            saveSettings={saveSettings}
            saveSession={saveSession}
          >
            <ListItemText
              primary="セッションID"
              secondary={sessionId === undefined ? "未設定" : sessionId}
            />
          </PersonalSessionSettingItem>
          <Divider component="li" />
          <SessionExpiresIn
            expiresIn={expiresIn}
            onChange={updateSessionExpiresIn}
          />
          <Divider component="li" />
          <ListItem
            button
            onClick={openResetSessionDialog}
            disabled={sessionId === undefined}
          >
            <ListItemText primary="セッションIDのリセット" />
            <ArrowRight />
          </ListItem>
          <Divider component="li" />
          <ListItem button onClick={openClearViewingsDialog}>
            <ListItemText primary="計測履歴の削除" />
            <ArrowRight />
          </ListItem>
          <Divider component="li" />
          <ListItem
            button
            onClick={openStatsCacheDialog}
            disabled={getStatsCacheIndex().size === 0}
          >
            <ListItemText primary="統計グラフのキャッシュを削除" />
            <ArrowRight />
          </ListItem>
        </List>
      </Paper>
    </Box>
  );
};
PrivacySettings.propTypes = {
  settings: PropTypes.shape({ expires_in: PropTypes.number }),
  saveSettings: PropTypes.instanceOf(Function),
  session: PropTypes.shape({ id: PropTypes.string, expires: PropTypes.number }),
  saveSession: PropTypes.instanceOf(Function),
};
PrivacySettings.defaultProps = {
  settings: undefined,
  saveSettings: undefined,
  session: undefined,
  saveSession: undefined,
};
export default PrivacySettings;
