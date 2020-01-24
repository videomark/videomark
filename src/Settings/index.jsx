import React, { useCallback } from "react";
import { useLocation } from "react-router";
import Container from "@material-ui/core/Container";
import Box from "@material-ui/core/Box";
import addYears from "date-fns/addYears";
import Header from "./Header";
import DesignSettings from "./DesignSettings";
import PrivacySettings from "./PrivacySettings";
import Reset from "./Reset";
import ThemeProvider from "../js/components/ThemeProvider";
import { clearStore as clearStatsCache } from "../js/containers/StatsDataProvider";
import { useSession, useSettings } from "../js/utils/ChromeExtensionWrapper";

const useOverwriteSessionId = ({
  settings,
  saveSettings,
  session,
  saveSession,
  searchParam
}) => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const sessionId = searchParams.get(searchParam);

  if (
    session === undefined ||
    settings === undefined ||
    sessionId == null ||
    session.id === sessionId
  )
    return;

  // TODO: https://github.com/webdino/sodium/issues/233
  // NOTE: オーバーフロー無く十分に長い適当な期間
  const expiresIn = addYears(0, 10).getTime();

  saveSettings({
    ...settings,
    expires_in: expiresIn
  });
  saveSession({ id: sessionId, expires: Date.now() + expiresIn });
};

export default () => {
  const [settings, saveSettings] = useSettings();
  const [session, saveSession] = useSession();
  const resetSettings = useCallback(() => {
    saveSettings({});
    saveSession({});
    clearStatsCache();
  }, [saveSettings, saveSession]);

  useOverwriteSessionId({
    settings,
    saveSettings,
    session,
    saveSession,
    searchParam: "session_id"
  });

  return (
    <ThemeProvider>
      <Header />
      <Box paddingTop={6}>
        <Container maxWidth="sm">
          <DesignSettings settings={settings} saveSettings={saveSettings} />
          <PrivacySettings
            settings={settings}
            saveSettings={saveSettings}
            session={session}
            saveSession={saveSession}
          />
          <Reset settings={settings} resetSettings={resetSettings} />
        </Container>
      </Box>
    </ThemeProvider>
  );
};
