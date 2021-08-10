import React, { useState, useCallback } from "react";
import PropTypes from "prop-types";
import { styled } from "@material-ui/styles";
import Box from "@material-ui/core/Box";
import Paper from "@material-ui/core/Paper";
import Typography from "@material-ui/core/Typography";
import MuiList from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import Switch from "@material-ui/core/Switch";
import { useMobile } from "../js/utils/Utils";

const List = styled(MuiList)({
  padding: 0,
});

const DesignSettings = ({ settings, saveSettings }) => {
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
  const mobile = useMobile();

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
            <ListItemText
              primary={mobile ? "計測中に結果をページに重ねて表示" : "計測値を対象の動画の左上に重ねて表示する"}
              secondary={changes ? "新しいページを読み込むと反映されます" : ""}
            />
            {settings && (
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
DesignSettings.propTypes = {
  settings: PropTypes.shape({ display_on_player: PropTypes.bool }),
  saveSettings: PropTypes.instanceOf(Function),
};
DesignSettings.defaultProps = {
  settings: undefined,
  saveSettings: undefined,
};
export default DesignSettings;
