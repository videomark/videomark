import React, { useState } from "react";
import Snackbar from "@material-ui/core/Snackbar";
import SnackbarContent from "@material-ui/core/SnackbarContent";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  root: { backgroundColor: theme.palette.error.dark },
}));
const ErrorSnackbar = (props) => {
  const [doing, setState] = useState(true);
  const onClose = () => setState(false);
  const classes = useStyles();
  return (
    <Snackbar doing={doing} onClose={onClose}>
      <SnackbarContent className={classes.root} {...props} />
    </Snackbar>
  );
};
export default ErrorSnackbar;
