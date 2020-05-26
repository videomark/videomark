import React from "react";
import Box from "@material-ui/core/Box";
import Grid from "@material-ui/core/Grid";
import CircularProgress from "@material-ui/core/CircularProgress";

export default () => (
  <Grid container justify="center">
    <Grid item>
      <Box
        position="absolute"
        zIndex={1}
        style={{ transform: "translate(-50%, 50%)" }}
      >
        <CircularProgress disableShrink />
      </Box>
    </Grid>
  </Grid>
);
