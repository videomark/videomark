import React, { useState, useEffect } from "react";
import { withRouter, Link } from "react-router-dom";
import CssBaseline from "@material-ui/core/CssBaseline";
import Container from "@material-ui/core/Container";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import ArrowBack from "@material-ui/icons/ArrowBack";
import Snackbar from "@material-ui/core/Snackbar";
import SnackbarContent from "@material-ui/core/SnackbarContent";
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import CircularProgress from "@material-ui/core/CircularProgress";
import { makeStyles } from "@material-ui/core/styles";
import { isCurrentVersion, migration } from "./js/utils/ChromeExtensionWrapper";

const useStyles = makeStyles(theme => ({
  root: { backgroundColor: theme.palette.error.dark }
}));
const ErrorSnackbar = props => {
  const [open, setOpen] = useState(true);
  const onClose = () => setOpen(false);
  const classes = useStyles();
  return (
    <Snackbar open={open} onClose={onClose}>
      <SnackbarContent className={classes.root} {...props} />
    </Snackbar>
  );
};
export const MigrationDialog = () => {
  const [error, setError] = useState(null);
  const [open, setOpen] = useState(false);
  const main = async () => {
    setError(null);
    try {
      if (await isCurrentVersion()) return;
      setOpen(true);
      await new Promise(resolve => {
        if (document.readyState === "loading")
          document.addEventListener("DOMContentLoaded", resolve, {
            once: true
          });
        else resolve();
      });
      await migration();
    } catch (e) {
      setError(e);
    }
    setOpen(false);
  };
  useEffect(() => {
    main();
  }, [setError, setOpen]);
  if (!open) return null;
  return (
    <>
      <Dialog open aria-labelledby="dialog-title">
        <DialogTitle id="dialog-title">最新のデータ形式に移行中...</DialogTitle>
        <Grid container justify="center" component={DialogContent}>
          <Grid item>
            <CircularProgress />
          </Grid>
        </Grid>
      </Dialog>
      {error && <ErrorSnackbar message={`移行に失敗しました。 (${error})`} />}
    </>
  );
};

export default withRouter(() => {
  const [open, setOpen] = useState(null);
  const onClick = () => setOpen(true);

  return (
    <Container>
      <CssBaseline />
      <Grid container justify="center" spacing={2}>
        <Grid item xs={12}>
          <Typography component="h1" variant="h5" align="center">
            データの移行
          </Typography>
          <Button component={Link} to="/">
            <ArrowBack />
            トップに戻る
          </Button>
        </Grid>
        <Grid item>
          <Button disabled={open} onClick={onClick}>
            最新のデータ形式に移行...
          </Button>
        </Grid>
      </Grid>
      {open && <MigrationDialog />}
    </Container>
  );
});
