import React from "react";
import { withRouter } from "react-router";
import { withStyles } from "@material-ui/core/styles";
import AppBar from "@material-ui/core/AppBar";
import Grid from "@material-ui/core/Grid";
import Box from "@material-ui/core/Box";
import Tabs from "@material-ui/core/Tabs";
import MuiTab from "@material-ui/core/Tab";
import IconButton from "@material-ui/core/IconButton";
import { Help } from "../components/Icons";
import { isMobile, isExtension } from "../utils/Utils";

const helpUrl = (base => {
  if (isMobile()) return new URL("android", base);
  if (isExtension()) return new URL("extension", base);
  return base;
})(new URL("https://vm.webdino.org/help/"));

const Tab = withStyles(theme => ({
  root: {
    [theme.breakpoints.up("sm")]: {
      paddingLeft: theme.spacing(4),
      paddingRight: theme.spacing(4)
    },
    fontSize: theme.typography.h6.fontSize
  }
}))(props => <MuiTab {...props} />);

export default withRouter(({ history }) => {
  const links = [
    { path: "/", label: "計測結果" },
    { path: "/history", label: "履歴" }
  ];
  const value = (
    links.find(({ path }) => path === history.location.pathname) || {
      path: "/"
    }
  ).path;
  return (
    <AppBar color="default">
      <Grid container alignItems="center" justify="space-between">
        <Grid item>
          <Box paddingLeft={5} />
        </Grid>
        <Grid item>
          <Tabs
            value={value}
            onChange={(_, nextPath) => {
              history.push(nextPath);
            }}
          >
            {links.map(({ path, label }) => (
              <Tab key={path} value={path} label={label} />
            ))}
          </Tabs>
        </Grid>
        <Grid item>
          <IconButton color="primary" href={helpUrl}>
            <Help />
          </IconButton>
        </Grid>
      </Grid>
    </AppBar>
  );
});
