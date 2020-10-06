import React from "react";
// @ts-expect-error ts-migrate(7016) FIXME: Try `npm install @types/react-router` if it exists... Remove this comment to see the full error message
import { useHistory } from "react-router";
import { withStyles } from "@material-ui/core/styles";
import AppBar from "@material-ui/core/AppBar";
import Grid from "@material-ui/core/Grid";
import Box from "@material-ui/core/Box";
import Tabs from "@material-ui/core/Tabs";
import MuiTab from "@material-ui/core/Tab";
import IconButton from "@material-ui/core/IconButton";
import Help from "@material-ui/icons/Help";
import Settings from "@material-ui/icons/Settings";
import helpURL from "../utils/helpURL";

const Tab = withStyles((theme) => ({
  root: {
    [theme.breakpoints.up("sm")]: {
      paddingLeft: theme.spacing(4),
      paddingRight: theme.spacing(4),
    },
    fontSize: theme.typography.h6.fontSize,
  },
}))(MuiTab);

export default () => {
  const history = useHistory();
  const links = [
    { path: "/", label: "計測結果" },
    { path: "/history", label: "履歴" },
  ];
  const value = (
    links.find(({ path }) => path === history.location.pathname) || {
      path: "/",
    }
  ).path;
  return (
    // @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
    <AppBar color="default">
      {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
      <Grid container alignItems="center" justify="space-between">
        {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
        <Grid item>
          {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
          <Box paddingLeft={12} />
        </Grid>
        {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
        <Grid item>
          {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
          <Tabs
            value={value}
            onChange={(_, nextPath) => {
              history.push(nextPath);
            }}
          >
            {links.map(({ path, label }) => (
              // @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
              <Tab key={path} value={path} label={label} />
            ))}
          </Tabs>
        </Grid>
        {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
        <Grid item>
          {/* @ts-expect-error ts-migrate(2769) FIXME: Property 'href' does not exist on type 'IntrinsicA... Remove this comment to see the full error message */}
          <IconButton color="primary" href={helpURL}>
            {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
            <Help color="action" />
          </IconButton>
          {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
          <IconButton color="primary" onClick={() => history.push("/settings")}>
            {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
            <Settings color="action" />
          </IconButton>
        </Grid>
      </Grid>
    </AppBar>
  );
};
