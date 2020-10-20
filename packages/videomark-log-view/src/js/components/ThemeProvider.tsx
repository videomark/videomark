import React from "react";
import { ThemeProvider as MuiThemeProvider } from "@material-ui/styles";
import { createMuiTheme } from "@material-ui/core/styles";
import CssBaseline from "@material-ui/core/CssBaseline";

const theme = createMuiTheme({
  palette: {
    primary: { main: "#1c2d69" },
    secondary: { main: "#d1101b" },
  },
});

type Props = {
    children: React.ReactNode;
};

const ThemeProvider = ({ children }: Props) => (
  // @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
  <MuiThemeProvider theme={theme}>
    {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
    <CssBaseline />
    {children}
  </MuiThemeProvider>
);

export default ThemeProvider;
