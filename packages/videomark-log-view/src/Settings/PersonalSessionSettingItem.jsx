import React from "react";
import PropTypes from "prop-types";
import ListItem from "@material-ui/core/ListItem";
import overwriteSessionId from "../js/utils/overwriteSessionId";
import getSessionType from "../js/utils/getSessionType";

/** 個人的セッションの設定用プロンプトの注入 - `ul` 要素用 */
const PersonalSessionSettingItem = ({
  children,
  settings,
  saveSettings,
  saveSession,
}) => {
  const handleClick = React.useCallback(
    (event) => {
      if (!saveSession) return;
      // NOTE: トリプルクリックすると個人的セッションの設定
      if (event?.detail !== 3) return;
      // TODO: prompt() は標準ではないので他の何らかのインタラクティブな入力方法に変更したい
      const sessionId = prompt("セッションIDを入力してください").trim();
      const type = getSessionType(sessionId);
      if (type !== "personal") {
        // TODO: alert() は標準ではないので他の何らかのインタラクティブな入力方法に変更したい
        alert("他のセッションIDを入力してください");
        return;
      }
      overwriteSessionId(settings, sessionId, {
        saveSettings,
        saveSession,
      });
    },
    [settings, saveSettings, saveSession]
  );

  return (
    // NOTE: フォーカスが当たらないように隠しておく
    // eslint-disable-next-line jsx-a11y/interactive-supports-focus,jsx-a11y/click-events-have-key-events
    <ListItem role="button" onClick={handleClick}>
      {children}
    </ListItem>
  );
};
PersonalSessionSettingItem.propTypes = {
  children: PropTypes.node,
  settings: PropTypes.shape({ expires_in: PropTypes.number }),
  saveSettings: PropTypes.instanceOf(Function),
  saveSession: PropTypes.instanceOf(Function),
};
PersonalSessionSettingItem.defaultProps = {
  children: null,
  settings: undefined,
  saveSettings: undefined,
  saveSession: undefined,
};
export default PersonalSessionSettingItem;
