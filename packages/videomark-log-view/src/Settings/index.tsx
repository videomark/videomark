import React, { useCallback } from "react";
// @ts-expect-error ts-migrate(7016) FIXME: Try `npm install @types/react-router` if it exists... Remove this comment to see the full error message
import { useLocation } from "react-router";
import Container from "@material-ui/core/Container";
import Box from "@material-ui/core/Box";
import addYears from "date-fns/addYears";
// @ts-expect-error ts-migrate(6142) FIXME: Module './Header' was resolved to '/home/kou029w/v... Remove this comment to see the full error message
import Header from "./Header";
// @ts-expect-error ts-migrate(6142) FIXME: Module './DesignSettings' was resolved to '/home/k... Remove this comment to see the full error message
import DesignSettings from "./DesignSettings";
// @ts-expect-error ts-migrate(6142) FIXME: Module './PrivacySettings' was resolved to '/home/... Remove this comment to see the full error message
import PrivacySettings from "./PrivacySettings";
// @ts-expect-error ts-migrate(6142) FIXME: Module './BitrateControlSettings' was resolved to ... Remove this comment to see the full error message
import BitrateControlSettings from "./BitrateControlSettings";
// @ts-expect-error ts-migrate(6142) FIXME: Module './Reset' was resolved to '/home/kou029w/vi... Remove this comment to see the full error message
import Reset from "./Reset";
// @ts-expect-error ts-migrate(6142) FIXME: Module '../js/components/ThemeProvider' was resolv... Remove this comment to see the full error message
import ThemeProvider from "../js/components/ThemeProvider";
// @ts-expect-error ts-migrate(6142) FIXME: Module '../js/containers/StatsDataProvider' was re... Remove this comment to see the full error message
import { clearStore as clearStatsCache } from "../js/containers/StatsDataProvider";
import { useSession, useSettings } from "../js/utils/ChromeExtensionWrapper";

const useOverwriteSessionId = ({
  settings,
  saveSettings,
  session,
  saveSession,
  searchParam
}: any) => {
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

  // NOTE: サーバー側で "_" が使えない
  if (/_/.test(sessionId)) {
    console.error("Session ID is invalid");
    return;
  }

  // TODO: https://github.com/webdino/sodium/issues/233
  // NOTE: オーバーフロー無く十分に長い適当な期間
  const expiresIn = addYears(0, 10).getTime();

  saveSettings({
    ...settings,
    expires_in: expiresIn,
  });
  saveSession({ id: sessionId, expires: Date.now() + expiresIn });
};

export default () => {
  const [settings, saveSettings] = useSettings();
  const [session, saveSession] = useSession();
  const resetSettings = useCallback(() => {
    // @ts-expect-error ts-migrate(2722) FIXME: Cannot invoke an object which is possibly 'undefin... Remove this comment to see the full error message
    saveSettings({});
    // @ts-expect-error ts-migrate(2722) FIXME: Cannot invoke an object which is possibly 'undefin... Remove this comment to see the full error message
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
    // @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
    <ThemeProvider>
      {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
      <Header />
      {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
      <Box paddingTop={6}>
        {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
        <Container maxWidth="sm">
          {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
          <DesignSettings settings={settings} saveSettings={saveSettings} />
          {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
          <PrivacySettings
            settings={settings}
            saveSettings={saveSettings}
            session={session}
            saveSession={saveSession}
          />
          {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
          <BitrateControlSettings
            settings={settings}
            saveSettings={saveSettings}
          />
          {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
          <Reset settings={settings} resetSettings={resetSettings} />
        </Container>
      </Box>
    </ThemeProvider>
  );
};
