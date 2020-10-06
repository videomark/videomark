import React, { useState, useCallback } from "react";
import Box from "@material-ui/core/Box";
import Typography from "@material-ui/core/Typography";
import Paper from "@material-ui/core/Paper";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import ArrowRight from "@material-ui/icons/ArrowRight";
// @ts-expect-error ts-migrate(6142) FIXME: Module './List' was resolved to '/home/kou029w/vid... Remove this comment to see the full error message
import List from "./List";
// @ts-expect-error ts-migrate(6142) FIXME: Module './Dialog' was resolved to '/home/kou029w/v... Remove this comment to see the full error message
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
            // @ts-expect-error ts-migrate(2345) FIXME: Type 'Element' provides no match for the signature... Remove this comment to see the full error message
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

type OwnResetProps = {
    settings?: {};
    resetSettings?: any; // TODO: PropTypes.instanceOf(Function)
};

// @ts-expect-error ts-migrate(2456) FIXME: Type alias 'ResetProps' circularly references itse... Remove this comment to see the full error message
type ResetProps = OwnResetProps & typeof Reset.defaultProps;

// @ts-expect-error ts-migrate(7022) FIXME: 'Reset' implicitly has type 'any' because it does ... Remove this comment to see the full error message
const Reset = ({ settings, resetSettings }: ResetProps) => {
  const [dialog, openDialog] = useDialog();
  const openResetSettingsDialog = useCallback(
    // @ts-expect-error ts-migrate(2721) FIXME: Cannot invoke an object which is possibly 'null'.
    () => openDialog("resetSettings", () => resetSettings()),
    [openDialog]
  );
  return (
    // @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
    <Box marginY={4}>
      {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
      <Box marginY={1}>
        {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
        <Typography component="h3" variant="body1">
          設定のリセット
        </Typography>
      </Box>
      {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
      <Paper>
        {dialog}
        {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
        <List>
          {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
          <ListItem
            button
            onClick={openResetSettingsDialog}
            disabled={settings === undefined}
          >
            {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
            <ListItemText primary="初期設定に戻す" />
            {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
            <ArrowRight />
          </ListItem>
        </List>
      </Paper>
    </Box>
  );
};
Reset.defaultProps = {
  settings: undefined,
  resetSettings: undefined,
};
export default Reset;
