import React, { useCallback } from "react";
import PropTypes from "prop-types";
import { styled } from "@material-ui/styles";
import Box from "@material-ui/core/Box";
import Paper from "@material-ui/core/Paper";
import Typography from "@material-ui/core/Typography";
import MuiList from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import Switch from "@material-ui/core/Switch";

const List = styled(MuiList)({
  padding: 0
});

const DesignSettings = ({ settings, saveSettings }) => {
  const { display_on_player: uninitializedDisplayOnPlayer } = settings || {};
  const displayOnPlayer =
    uninitializedDisplayOnPlayer == null || uninitializedDisplayOnPlayer;

  const handleDisplaySettingChange = useCallback(
    event => {
      saveSettings({
        ...settings,
        display_on_player: event.target.checked
      });
    },
    [saveSettings]
  );

  return (
    <Box marginY={4}>
      <Box marginY={1}>
        <Typography component="h3" variant="body1">
          デザイン
        </Typography>
      </Box>
      <Paper>
        <List>
          <ListItem>
            <ListItemText primary="動画再生中のプレイヤー上に計測値を表示する" />
            <Switch
              checked={displayOnPlayer}
              onChange={handleDisplaySettingChange}
              value="Display Setting"
              inputProps={{ "aria-label": "Display Setting" }}
            />
          </ListItem>
        </List>
      </Paper>
    </Box>
  );
};
DesignSettings.propTypes = {
  settings: PropTypes.shape({}),
  saveSettings: PropTypes.instanceOf(Function)
};
DesignSettings.defaultProps = {
  settings: undefined,
  saveSettings: undefined
};
export default DesignSettings;
