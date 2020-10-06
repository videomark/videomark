import React from "react";
import { useHistory } from "react-router";
import Box from "@material-ui/core/Box";
import AppBar from "@material-ui/core/AppBar";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import IconButton from "@material-ui/core/IconButton";
import Close from "@material-ui/icons/Close";

const Header = () => {
  const history = useHistory();
  const close =
    history.length > 1 ? () => history.goBack() : () => window.close();

  return (
    <AppBar color="default">
      <Box
        height={48}
        component={Grid}
        container
        alignItems="center"
        justify="space-between"
      >
        <Grid item>
          <Box paddingLeft={6} />
        </Grid>
        <Grid item>
          <Typography component="h1" variant="h6">
            設定
          </Typography>
        </Grid>
        <Grid item>
          <IconButton color="primary" onClick={close}>
            <Close color="action" />
          </IconButton>
        </Grid>
      </Box>
    </AppBar>
  );
};
export default Header;
