import React from "react";
import PropTypes from "prop-types";
import { ThemeProvider as MuiThemeProvider } from "@material-ui/styles";
import { createMuiTheme } from "@material-ui/core/styles";
import CssBaseline from "@material-ui/core/CssBaseline";
import useMediaQuery from '@material-ui/core/useMediaQuery';

const ThemeProvider = ({ children }) => {
  const theme = createMuiTheme({
    palette: {
      // This has to be in a component because of underlying `window.matchMedia()`
      type: useMediaQuery('(prefers-color-scheme: dark)') ? 'dark' : 'light',
      primary: { main: "#1c2d69" },
      secondary: { main: "#d1101b" },
    },
  });

  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </MuiThemeProvider>
  );
};

ThemeProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default ThemeProvider;
