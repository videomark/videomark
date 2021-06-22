import React from "react";
import PropTypes from "prop-types";
import { ThemeProvider as MuiThemeProvider } from "@material-ui/styles";
import { createMuiTheme } from "@material-ui/core/styles";
import CssBaseline from "@material-ui/core/CssBaseline";
import useMediaQuery from '@material-ui/core/useMediaQuery';
import { indigo, red } from '@material-ui/core/colors';

const ThemeProvider = ({ children }) => {
  const isDarkMode = useMediaQuery("(prefers-color-scheme: dark)");

  const theme = createMuiTheme({
    palette: {
      // This has to be in a component because of underlying `window.matchMedia()`
      type: isDarkMode ? "dark" : "light",
      primary: {
        main: indigo[isDarkMode ? 'A100' : 700],
      },
      secondary: {
        main: red[isDarkMode ? 'A100' : 700],
      },
    },
    typography: {
      button: {
        fontWeight: 'bold',
      }
    }
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
