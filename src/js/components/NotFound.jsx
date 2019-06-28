import React from "react";
import { Link } from "react-router-dom";
import { CssBaseline, Grid, Typography, Button } from "@material-ui/core";
import { withStyles } from "@material-ui/core/styles";
import { ArrowBack } from "@material-ui/icons";

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
