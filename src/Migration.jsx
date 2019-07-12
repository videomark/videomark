import React, { useState } from "react";
import { withRouter, Link } from "react-router-dom";
import CssBaseline from "@material-ui/core/CssBaseline";
import Container from "@material-ui/core/Container";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import ArrowBack from "@material-ui/icons/ArrowBack";
import { migration } from "./js/utils/ChromeExtensionWrapper";

export default withRouter(({ history }) => {
  const [errorMessage, setErrorMessage] = useState(null);
  const [locked, lock] = useState(false);
  const onClick = async () => {
    lock(true);
    setErrorMessage(null);
    try {
      await migration();
      history.push("/");
    } catch (error) {
      setErrorMessage(`移行に失敗しました。 (${error})`);
    }
    lock(false);
  };
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
          <Button disabled={locked} onClick={onClick}>
            最新のデータ形式に移行...
          </Button>
          {errorMessage && (
            <Typography color="secondary">{errorMessage}</Typography>
          )}
        </Grid>
      </Grid>
    </Container>
  );
});
