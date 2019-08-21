import React from "react";
import PropTypes from "prop-types";
import { ThemeProvider as MuiThemeProvider } from "@material-ui/styles";
import { createMuiTheme } from "@material-ui/core/styles";
import CssBaseline from "@material-ui/core/CssBaseline";

const theme = createMuiTheme({
  palette: {
    primary: { main: "#1c2d69" },
    secondary: { main: "#d1101b" }
  }
});

const ThemeProvider = ({ children }) => (
  <MuiThemeProvider theme={theme}>
    <CssBaseline />
    {children}
  </MuiThemeProvider>
);
ThemeProvider.propTypes = {
  children: PropTypes.node.isRequired
};

export default ThemeProvider;
