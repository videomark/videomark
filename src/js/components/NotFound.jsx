import React from "react";
import { Link } from "react-router-dom";
import { makeStyles } from "@material-ui/core/styles";
import CssBaseline from "@material-ui/core/CssBaseline";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import ArrowBack from "@material-ui/icons/ArrowBack";

const useStyles = makeStyles({
  root: {
    width: "100vw",
    height: "100vh"
  }
});
export default () => {
  const classes = useStyles();
  return (
    <>
      <CssBaseline />
      <Grid
        className={classes.root}
        container
        justify="center"
        alignContent="center"
      >
        <Grid item>
          <Typography component="h1" variant="h6">
            このページは存在しません
          </Typography>
          <Button component={Link} to="/">
            <ArrowBack />
            トップに戻る
          </Button>
        </Grid>
      </Grid>
    </>
  );
};
