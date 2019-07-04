import React, { useState } from "react";
import { Link } from "react-router-dom";
import CssBaseline from "@material-ui/core/CssBaseline";
import Container from "@material-ui/core/Container";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import ArrowBack from "@material-ui/icons/ArrowBack";
import { storage } from "./js/utils/ChromeExtensionWrapper";

export default () => {
  const [locked, lock] = useState(false);
  const onClick = async () => {
    lock(true);
    const entries = Object.entries(
      await new Promise(resolve => storage().get(resolve))
    ).map(([key, value]) => `${JSON.stringify(key)}:${JSON.stringify(value)}`);
    const blob = new Blob(["{", entries.join(), "}"], {
      type: "data:application/json"
    });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `videomark-${Date.now()}.json`;
    a.click();
    lock(false);
  };
  return (
    <Container>
      <CssBaseline />
      <Grid container justify="center" spacing={2}>
        <Grid item xs={12}>
          <Typography component="h1" variant="h5" align="center">
            計測結果のエクスポート
          </Typography>
          <Button component={Link} to="/">
            <ArrowBack />
            トップに戻る
          </Button>
        </Grid>
        <Grid item>
          <Button disabled={locked} onClick={onClick}>
            JSONファイルにエクスポート...
          </Button>
        </Grid>
      </Grid>
    </Container>
  );
};
