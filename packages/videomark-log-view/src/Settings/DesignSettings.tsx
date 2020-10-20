import React, { useState, useCallback } from "react";
import { styled } from "@material-ui/styles";
import Box from "@material-ui/core/Box";
import Paper from "@material-ui/core/Paper";
import Typography from "@material-ui/core/Typography";
import MuiList from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import Switch from "@material-ui/core/Switch";
import { isMobile } from "../js/utils/Utils";

const List = styled(MuiList)({
  padding: 0,
});

type OwnProps = {
    settings?: {
        display_on_player?: boolean;
    };
    saveSettings?: any; // TODO: PropTypes.instanceOf(Function)
};

// @ts-expect-error ts-migrate(2456) FIXME: Type alias 'Props' circularly references itself.
type Props = OwnProps & typeof DesignSettings.defaultProps;

// @ts-expect-error ts-migrate(7022) FIXME: 'DesignSettings' implicitly has type 'any' because... Remove this comment to see the full error message
const DesignSettings = ({ settings, saveSettings }: Props) => {
  const [changes, setChanges] = useState(false);
  const { display_on_player: uninitializedDisplayOnPlayer } = settings || {};
  const displayOnPlayer =
    uninitializedDisplayOnPlayer == null || uninitializedDisplayOnPlayer;
  const handleDisplaySettingChange = useCallback(
    (event) => {
      setChanges(!changes);
      saveSettings({
        ...settings,
        display_on_player: event.target.checked,
      });
    },
    [changes, setChanges, settings, saveSettings]
  );

  return (
    // @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
    <Box marginY={4}>
      {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
      <Box marginY={1}>
        {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
        <Typography component="h3" variant="body1">
          デザイン
        </Typography>
      </Box>
      {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
      <Paper>
        {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
        <List>
          {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
          <ListItem>
            {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
            <ListItemText
              primary={isMobile() ? "計測中に結果をページに重ねて表示" : "計測値を対象の動画の左上に重ねて表示する"}
              secondary={changes ? "新しいページを読み込むと反映されます" : ""}
            />
            {settings && (
              // @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
              <Switch
                checked={displayOnPlayer}
                onChange={handleDisplaySettingChange}
                value="Display Setting"
                inputProps={{ "aria-label": "Display Setting" }}
              />
            )}
          </ListItem>
        </List>
      </Paper>
    </Box>
  );
};
DesignSettings.defaultProps = {
  settings: undefined,
  saveSettings: undefined,
};
export default DesignSettings;
