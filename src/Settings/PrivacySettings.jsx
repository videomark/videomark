import React, { useState, useCallback } from "react";
import PropTypes from "prop-types";
import Box from "@material-ui/core/Box";
import Typography from "@material-ui/core/Typography";
import Paper from "@material-ui/core/Paper";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import ArrowRight from "@material-ui/icons/ArrowRight";
import Divider from "@material-ui/core/Divider";
import uuidv4 from "uuid/v4";
import formatDistanceStrict from "date-fns/formatDistanceStrict";
import locale from "date-fns/locale/ja";
import List from "./List";
import Dialog from "./Dialog";
import {
  clearStore as clearStatsCache,
  getStoredIndex as getStatsCacheIndex
} from "../js/containers/StatsDataProvider";
import { clearViewings } from "../js/utils/ChromeExtensionWrapper";

/** デフォルトのセッション保持期間 */
const defaultSessionExpiresIn = 2592e6; //= 30日間 (うるう秒は考慮しない)

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
                "ただし、サーバーに保存されているデータは残ります。"
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

const PrivacySettings = ({ settings, session, saveSession }) => {
  const { expires_in: expiresIn } = settings === undefined ? {} : settings;
  const { id: sessionId } = session === undefined ? { id: "..." } : session;
  const [dialog, openDialog] = useDialog();
  const openResetSessionDialog = useCallback(
    () =>
      openDialog("resetSession", () =>
        saveSession({
          id: uuidv4(),
          expires:
            Date.now() +
            (Number.isFinite(expiresIn) ? expiresIn : defaultSessionExpiresIn)
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
  settings: PropTypes.shape({}),
  session: PropTypes.shape({}),
  saveSession: PropTypes.instanceOf(Function)
};
PrivacySettings.defaultProps = {
  settings: undefined,
  session: undefined,
  saveSession: undefined
};
export default PrivacySettings;
