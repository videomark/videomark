import React, { useState, useCallback, useEffect } from "react";
import { styled } from "@material-ui/styles";
import Box from "@material-ui/core/Box";
import Paper from "@material-ui/core/Paper";
import Typography from "@material-ui/core/Typography";
import MuiList from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import Switch from "@material-ui/core/Switch";

const getRandomToken = () => {
  const randomPool = new Uint8Array(16);
  crypto.getRandomValues(randomPool);
  let hex = "";
  for (var i = 0; i < randomPool.length; ++i) {
    hex += randomPool[i].toString(16);
  }
  return hex;
};

const useTabStatus = () => {
  const [alive, setAlive] = useState(false);
  const [displayOnPlayer, setDisplayOnPlayer] = useState(false);

  useEffect(() => {
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'chrome'.
    chrome.tabs.query( {active:true, currentWindow:true}, (tabs: any) => {
      const tab = tabs[0];

      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'chrome'.
      const port = chrome.runtime.connect({
        name: "sodium-popup-communication-port"
      });
      const requestId = getRandomToken();

      const listener = (value: any) => {
        if (value.requestId !== requestId) return false;

        try {
          setAlive(value.alive);
          setDisplayOnPlayer(value.displayOnPlayer);
        } catch (e) {
          // nop
        } finally {
          port.onMessage.removeListener(listener);
        }
        return true;
      };

      port.onMessage.addListener(listener);
      port.postMessage({
        requestId,
        method: "getTabStatus",
        args: [tab.id]
      });
    });
  });

  return { alive, displayOnPlayer, setDisplayOnPlayer };
};

const List = styled(MuiList)({
  padding: 0,
});

const QualityUiSetting = () => {
  const { alive, displayOnPlayer, setDisplayOnPlayer } = useTabStatus();

  const handleDisplaySettingChange = useCallback(
    () => {
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'chrome'.
      chrome.tabs.query( {active:true, currentWindow:true}, (tabs: any) => {
        const tab = tabs[0];
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'chrome'.
        chrome.tabs.sendMessage(tab.id, { type: "FROM_EXTENSION_POPUP", method: "display_ui", enabled: !displayOnPlayer }, () => {
          setDisplayOnPlayer(!displayOnPlayer);
        });
      });
    },
    [displayOnPlayer, setDisplayOnPlayer]
  );

  return (
    // @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
    <Box marginY={4}>
      { alive &&
        // @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
        <Box>
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
                  primary="計測値を対象の動画の左上に重ねて表示する"
                />
                {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
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
      }
    </Box>
  );
};
QualityUiSetting.propTypes = {
};
QualityUiSetting.defaultProps = {
};
export default QualityUiSetting;
