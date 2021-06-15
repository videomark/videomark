import React, { useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import Box from "@material-ui/core/Box";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import Link from "@material-ui/core/Link";
import Snackbar from "@material-ui/core/Snackbar";
import SnackbarContent from "@material-ui/core/SnackbarContent";
import Button from "@material-ui/core/Button";
import Input from "@material-ui/icons/Input";
import { ReactComponent as Usage } from "./usage.svg";
import { isWeb } from "../../utils/Utils";
import videoPlatforms from "../../utils/videoPlatforms";
import dino from "../../../images/dino.png";
import { useTheme } from "@material-ui/core/styles";

const ExperimentalSnackbar = () => {
  const [open, setOpen] = useState(true);
  const onClose = () => setOpen(false);
  return (
    <Snackbar open={open} onClose={onClose} variant="info">
      <SnackbarContent message="この画面は試験的機能です。" />
    </Snackbar>
  );
};
const ImportButton = () => (
  <Button component={RouterLink} to="/import" color="primary">
    <Input />
    <Box paddingLeft={1}>計測結果をインポート...</Box>
  </Button>
);

export default () => {
  const { palette } = useTheme();

  const usageStyle = {
    filter: palette.type === 'dark' ? 'invert(1)' : 'invert(0.25)',
  };

  return (
    <>
      {isWeb() ? <ExperimentalSnackbar /> : null}
      <Box position="fixed" top={48} right={14}>
        <Usage style={usageStyle} />
      </Box>
      <Box paddingTop={8}>
        <Grid container justify="space-between">
          <Grid item sm={6}>
            <Box paddingTop={2} paddingBottom={2}>
              <Typography component="h1" variant="h4">
                Web VideoMark
              </Typography>
              <Typography variant="subtitle1">
                ネットワークは実サービス利用時の品質で評価する時代へ
              </Typography>
              {isWeb() ? <ImportButton /> : null}
            </Box>
            <Typography component="h2" variant="h6">
              計測可能な動画配信サービス
            </Typography>
            <Box fontSize="body1.fontSize">
              <ul>
                {videoPlatforms.map(({ id, name, url, experimental }) =>
                  experimental ? null : (
                    <li key={id}>
                      <Link href={url} color="secondary">{name}</Link>
                    </li>
                  )
                )}
              </ul>
            </Box>
            <Typography>
              調査対象となる動画配信サービスでいつも通り動画をお楽しみください。
            </Typography>
            <Typography>
              動画視聴中に自動的に再生品質やネットワーク品質などの視聴情報を記録します。
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Box paddingTop={4} textAlign="center">
              <img src={dino} alt="dinoくん" />
            </Box>
          </Grid>
        </Grid>
      </Box>
    </>
  );
};
