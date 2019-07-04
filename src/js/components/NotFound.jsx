import React from "react";
import { Link } from "react-router-dom";
import CssBaseline from "@material-ui/core/CssBaseline";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import { withStyles } from "@material-ui/core/styles";
import ArrowBack from "@material-ui/icons/ArrowBack";

export default withStyles(() => ({
  root: {
    width: "100vw",
    height: "100vh"
  }
}))(({ classes }) => (
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
));
