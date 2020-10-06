import React, { useState } from "react";
import Snackbar from "@material-ui/core/Snackbar";
import SnackbarContent from "@material-ui/core/SnackbarContent";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  root: { backgroundColor: theme.palette.error.dark },
}));
const ErrorSnackbar = (props: any) => {
  const [doing, setState] = useState(true);
  const onClose = () => setState(false);
  const classes = useStyles();
  return (
    // @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
    <Snackbar doing={doing} onClose={onClose}>
      {/* eslint-disable-next-line react/jsx-props-no-spreading */}
      {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
      <SnackbarContent className={classes.root} {...props} />
    </Snackbar>
  );
};
export default ErrorSnackbar;
