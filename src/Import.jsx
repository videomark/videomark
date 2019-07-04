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
  const [errorMessage, setErrorMessage] = useState(null);
  const [locked, lock] = useState(false);
  const onChange = async e => {
    const { files } = e.currentTarget;
    if (files.length !== 1) return;
    setErrorMessage(null);
    lock(true);
    const [file] = files;
    const result = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = rogressEvent => {
        try {
          const json = JSON.parse(rogressEvent.target.result);
          if (!(json.AgreedTerm || json.RemovedTargetKeys))
            throw new Error("invalid format");
          resolve(json);
        } catch (error) {
          reject(error);
        }
      };
      reader.readAsText(file);
    }).catch(error => setErrorMessage(`インポートに失敗しました。 (${error})`));
    storage().set(result);
    lock(false);
  };
  return (
    <Container>
      <CssBaseline />
      <Grid container justify="center" spacing={2}>
        <Grid item xs={12}>
          <Typography component="h1" variant="h5" align="center">
            計測結果のインポート
          </Typography>
          <Button component={Link} to="/">
            <ArrowBack />
            トップに戻る
          </Button>
        </Grid>
        <Grid item>
          <input
            disabled={locked}
            type="file"
            accept="application/json"
            onChange={onChange}
          />
          {errorMessage && (
            <Typography color="secondary">{errorMessage}</Typography>
          )}
        </Grid>
      </Grid>
    </Container>
  );
};
