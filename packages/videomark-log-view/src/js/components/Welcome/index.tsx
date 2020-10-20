import React, { useState } from "react";
// @ts-expect-error ts-migrate(7016) FIXME: Try `npm install @types/react-router-dom` if it ex... Remove this comment to see the full error message
import { Link as RouterLink } from "react-router-dom";
import Box from "@material-ui/core/Box";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import Link from "@material-ui/core/Link";
import Snackbar from "@material-ui/core/Snackbar";
import SnackbarContent from "@material-ui/core/SnackbarContent";
import Button from "@material-ui/core/Button";
import Input from "@material-ui/icons/Input";
// @ts-expect-error ts-migrate(2307) FIXME: Cannot find module './usage.svg' or its correspond... Remove this comment to see the full error message
import { ReactComponent as Usage } from "./usage.svg";
import { isWeb } from "../../utils/Utils";
import videoPlatforms from "../../utils/videoPlatforms";
// @ts-expect-error ts-migrate(2307) FIXME: Cannot find module '../../../images/dino.png' or i... Remove this comment to see the full error message
import dino from "../../../images/dino.png";

const ExperimentalSnackbar = () => {
  const [open, setOpen] = useState(true);
  const onClose = () => setOpen(false);
  return (
    // @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
    <Snackbar open={open} onClose={onClose} variant="info">
      {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
      <SnackbarContent message="この画面は試験的機能です。" />
    </Snackbar>
  );
};
const ImportButton = () => (
  // @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
  <Button component={RouterLink} to="/import" color="primary">
    {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
    <Input />
    {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
    <Box paddingLeft={1}>計測結果をインポート...</Box>
  </Button>
);

export default () => (
  // @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
  <>
    {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
    {isWeb() ? <ExperimentalSnackbar /> : null}
    {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
    <Box position="fixed" top={48} right={14}>
      {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
      <Usage />
    </Box>
    {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
    <Box paddingTop={8}>
      {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
      <Grid container justify="space-between">
        {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
        <Grid item sm={6}>
          {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
          <Box paddingTop={2} paddingBottom={2}>
            {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
            <Typography component="h1" variant="h4">
              Web VideoMark
            </Typography>
            {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
            <Typography variant="subtitle1">
              ネットワークは実サービス利用時の品質で評価する時代へ
            </Typography>
            {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
            {isWeb() ? <ImportButton /> : null}
          </Box>
          {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
          <Typography component="h2" variant="h6">
            計測可能な動画配信サービス
          </Typography>
          {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
          <Box fontSize="body1.fontSize">
            {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
            <ul>
              {videoPlatforms.map(({ id, name, url, experimental }) =>
                experimental ? null : (
                  // @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
                  <li key={id}>
                    {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
                    <Link href={url}>{name}</Link>
                  </li>
                )
              )}
            </ul>
          </Box>
          {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
          <Typography>
            調査対象となる動画配信サービスでいつも通り動画をお楽しみください。
          </Typography>
          {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
          <Typography>
            動画視聴中に自動的に再生品質やネットワーク品質などの視聴情報を記録します。
          </Typography>
        </Grid>
        {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
        <Grid item xs={12} sm={6}>
          {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
          <Box paddingTop={4} textAlign="center">
            {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
            <img src={dino} alt="dinoくん" />
          </Box>
        </Grid>
      </Grid>
    </Box>
  </>
);
