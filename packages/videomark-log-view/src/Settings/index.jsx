import React, { useCallback } from "react";
import { useLocation } from "react-router";
import Container from "@material-ui/core/Container";
import Box from "@material-ui/core/Box";
import Header from "./Header";
import DesignSettings from "./DesignSettings";
import PrivacySettings from "./PrivacySettings";
import BitrateControlSettings from "./BitrateControlSettings";
import Reset from "./Reset";
import ThemeProvider from "../js/components/ThemeProvider";
import { clearStore as clearStatsCache } from "../js/containers/StatsDataProvider";
import { useSession, useSettings } from "../js/utils/ChromeExtensionWrapper";
import overwriteSessionId from "../js/utils/overwriteSessionId";

const useOverwriteSessionId = ({
  settings,
  saveSettings,
  session,
  saveSession,
  searchParam,
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

  overwriteSessionId(settings, sessionId, {
    saveSettings,
    saveSession,
  });
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
    searchParam: "session_id",
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
          <BitrateControlSettings
            settings={settings}
            saveSettings={saveSettings}
          />
          <Reset settings={settings} resetSettings={resetSettings} />
        </Container>
      </Box>
    </ThemeProvider>
  );
};
