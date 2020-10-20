import React, { useState, useCallback } from "react";
import makeStyles from "@material-ui/core/styles/makeStyles";
import Box from "@material-ui/core/Box";
import Typography from "@material-ui/core/Typography";
import Paper from "@material-ui/core/Paper";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import Slider from "@material-ui/core/Slider";
import ArrowRight from "@material-ui/icons/ArrowRight";
import Divider from "@material-ui/core/Divider";
// @ts-expect-error ts-migrate(7016) FIXME: Try `npm install @types/uuid` if it exists or add ... Remove this comment to see the full error message
import { v4 as uuidv4 } from "uuid";
import addDays from "date-fns/addDays";
import formatDistanceStrict from "date-fns/formatDistanceStrict";
import locale from "date-fns/locale/ja";
// @ts-expect-error ts-migrate(6142) FIXME: Module './List' was resolved to '/home/kou029w/vid... Remove this comment to see the full error message
import List from "./List";
// @ts-expect-error ts-migrate(6142) FIXME: Module './Dialog' was resolved to '/home/kou029w/v... Remove this comment to see the full error message
import Dialog from "./Dialog";
import {
  clearStore as clearStatsCache,
  getStoredIndex as getStatsCacheIndex,
// @ts-expect-error ts-migrate(6142) FIXME: Module '../js/containers/StatsDataProvider' was re... Remove this comment to see the full error message
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
// @ts-expect-error ts-migrate(2532) FIXME: Object is possibly 'undefined'.
const sessionExpiresInToValue = (expiresIn: any) => (
  sessionExpiresInMarks.find((mark) => mark.expiresIn === expiresIn) ||
  sessionExpiresInMarks.find(
    (mark) => mark.expiresIn === defaultSessionExpiresIn
  )
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

type OwnSessionExpiresInProps = {
    expiresIn?: number;
    onChange: any; // TODO: PropTypes.instanceOf(Function)
};

// @ts-expect-error ts-migrate(2456) FIXME: Type alias 'SessionExpiresInProps' circularly refe... Remove this comment to see the full error message
type SessionExpiresInProps = OwnSessionExpiresInProps & typeof SessionExpiresIn.defaultProps;

// @ts-expect-error ts-migrate(7022) FIXME: 'SessionExpiresIn' implicitly has type 'any' becau... Remove this comment to see the full error message
const SessionExpiresIn = ({ expiresIn, onChange }: SessionExpiresInProps) => {
  const classes = useStyle();
  return (
    // @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
    <ListItem className={classes.sessionExpiresIn}>
      {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
      <ListItemText
        primary="セッション保持期間"
        secondary={
          expiresIn > 0
            ? formatDistanceStrict(0, expiresIn, { unit: "day", locale })
            : "新しいページを読み込むまで"
        }
      />
      {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
      <Slider
        color="secondary"
        marks={sessionExpiresInMarks}
        max={sessionExpiresInMarks.length - 1}
        value={sessionExpiresInToValue(expiresIn)}
        onChange={(_, value) => {
          // @ts-expect-error ts-migrate(2538) FIXME: Type 'number[]' cannot be used as an index type.
          onChange(sessionExpiresInMarks[value].expiresIn);
        }}
      />
    </ListItem>
  );
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
            // @ts-expect-error ts-migrate(2345) FIXME: Type 'Element' provides no match for the signature... Remove this comment to see the full error message
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
            // @ts-expect-error ts-migrate(2345) FIXME: Argument of type 'Element' is not assignable to pa... Remove this comment to see the full error message
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
            // @ts-expect-error ts-migrate(2345) FIXME: Argument of type 'Element' is not assignable to pa... Remove this comment to see the full error message
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

type OwnPrivacySettingsProps = {
    settings?: {
        expires_in?: number;
    };
    saveSettings?: any; // TODO: PropTypes.instanceOf(Function)
    session?: {
        id?: string;
        expires?: number;
    };
    saveSession?: any; // TODO: PropTypes.instanceOf(Function)
};

// @ts-expect-error ts-migrate(2456) FIXME: Type alias 'PrivacySettingsProps' circularly refer... Remove this comment to see the full error message
type PrivacySettingsProps = OwnPrivacySettingsProps & typeof PrivacySettings.defaultProps;

// @ts-expect-error ts-migrate(7022) FIXME: 'PrivacySettings' implicitly has type 'any' becaus... Remove this comment to see the full error message
const PrivacySettings = ({ settings, saveSettings, session, saveSession }: PrivacySettingsProps) => {
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
      // @ts-expect-error ts-migrate(2721) FIXME: Cannot invoke an object which is possibly 'null'.
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
      // @ts-expect-error ts-migrate(2721) FIXME: Cannot invoke an object which is possibly 'null'.
      openDialog("clearViewings", () => {
        clearStatsCache();
        clearViewings();
      }),
    [openDialog]
  );
  const openStatsCacheDialog = useCallback(
    // @ts-expect-error ts-migrate(2721) FIXME: Cannot invoke an object which is possibly 'null'.
    () => openDialog("clearStatsCache", () => clearStatsCache()),
    [openDialog]
  );

  return (
    // @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
    <Box marginY={4}>
      {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
      <Box marginY={1}>
        {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
        <Typography component="h3" variant="body1">
          プライバシー
        </Typography>
      </Box>
      {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
      <Paper>
        {dialog}
        {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
        <List>
          {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
          <ListItem>
            {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
            <ListItemText
              primary="セッションID"
              secondary={sessionId === undefined ? "未設定" : sessionId}
            />
          </ListItem>
          {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
          <Divider component="li" />
          {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
          <SessionExpiresIn
            expiresIn={expiresIn}
            onChange={updateSessionExpiresIn}
          />
          {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
          <Divider component="li" />
          {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
          <ListItem
            button
            onClick={openResetSessionDialog}
            disabled={sessionId === undefined}
          >
            {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
            <ListItemText primary="セッションIDのリセット" />
            {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
            <ArrowRight />
          </ListItem>
          {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
          <Divider component="li" />
          {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
          <ListItem button onClick={openClearViewingsDialog}>
            {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
            <ListItemText primary="計測履歴の削除" />
            {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
            <ArrowRight />
          </ListItem>
          {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
          <Divider component="li" />
          {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
          <ListItem
            button
            onClick={openStatsCacheDialog}
            disabled={getStatsCacheIndex().size === 0}
          >
            {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
            <ListItemText primary="統計グラフのキャッシュを削除" />
            {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
            <ArrowRight />
          </ListItem>
        </List>
      </Paper>
    </Box>
  );
};
PrivacySettings.defaultProps = {
  settings: undefined,
  saveSettings: undefined,
  session: undefined,
  saveSession: undefined,
};
export default PrivacySettings;
