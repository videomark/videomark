import React, { useState, useCallback, useEffect } from "react";
import { styled } from "@material-ui/styles";
import Box from "@material-ui/core/Box";
import Paper from "@material-ui/core/Paper";
import Typography from "@material-ui/core/Typography";
import MuiList from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import Switch from "@material-ui/core/Switch";
import { useMobile } from "./js/utils/Utils.js";

const useTabStatus = () => {
  const [alive, setAlive] = useState(false);
  const [displayOnPlayer, setDisplayOnPlayer] = useState(false);

  useEffect(() => {
    setInterval(() => {
      chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
        const response = await chrome.runtime.sendMessage({
          method: "getTabStatus",
          args: [tabs[0].id]
        });

        setAlive(response.alive);
        setDisplayOnPlayer(response.displayOnPlayer);
      });
    }, 1000);
  }, []);

  return { alive, displayOnPlayer, setDisplayOnPlayer };
};

const List = styled(MuiList)({
  padding: 0,
});

const QualityUiSetting = () => {
  const { alive, displayOnPlayer, setDisplayOnPlayer } = useTabStatus();

  const mobile = useMobile();

  const handleDisplaySettingChange = useCallback(
    () => {
      chrome.tabs.query( {active:true, currentWindow:true}, tabs => {
        const tab = tabs[0];
        chrome.tabs.sendMessage(tab.id, { type: "FROM_EXTENSION_POPUP", method: "display_ui", enabled: !displayOnPlayer }, () => {
          setDisplayOnPlayer(!displayOnPlayer);
          window.close();
        });
      });
    },
    [displayOnPlayer, setDisplayOnPlayer]
  );

  if (!alive) return null;

  return (
    <Box marginY={4}>
      <Box>
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
              />
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
    </Box>
  );
};
QualityUiSetting.propTypes = {
};
QualityUiSetting.defaultProps = {
};
export default QualityUiSetting;
