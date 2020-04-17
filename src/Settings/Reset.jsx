import React, { useState, useCallback } from "react";
import PropTypes from "prop-types";
import Box from "@material-ui/core/Box";
import Typography from "@material-ui/core/Typography";
import Paper from "@material-ui/core/Paper";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import ArrowRight from "@material-ui/icons/ArrowRight";
import List from "./List";
import Dialog from "./Dialog";

const useDialog = () => {
  const [dialog, setDialog] = useState(null);
  const openDialog = useCallback(
    (type, handler) => {
      const onClose = () => {
        setDialog(null);
      };
      switch (type) {
        case "resetSettings":
          return setDialog(
            <Dialog
              open
              title="設定のリセット"
              description={[
                "設定を既定値にリセットします。",
                "セッションIDと統計グラフのキャッシュを削除します。",
                "ただし、計測結果とその履歴はそのまま残ります。",
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
            <ArrowRight />
          </ListItem>
        </List>
      </Paper>
    </Box>
  );
};
Reset.propTypes = {
  settings: PropTypes.shape({}),
  resetSettings: PropTypes.instanceOf(Function),
};
Reset.defaultProps = {
  settings: undefined,
  resetSettings: undefined,
};
export default Reset;
