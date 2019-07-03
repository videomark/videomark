import React from "react";
import Box from "@material-ui/core/Box";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import Link from "@material-ui/core/Link";
import { ReactComponent as AboutHelp } from "./about-help.svg";
import videoPlatforms from "../../utils/videoPlatforms.json";
import dino from "../../../images/dino.png";

export default () => (
  <>
    <Box position="fixed" top={48} right={16}>
      <AboutHelp />
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
          </Box>
          <Typography component="h2" variant="h6">
            計測可能な動画配信サービス
          </Typography>
          <Box fontSize="body1.fontSize">
            <ul>
              {videoPlatforms.map(({ id, name, url }) => (
                <li key={id}>
                  <Link href={url}>{name}</Link>
                </li>
              ))}
            </ul>
          </Box>
          <Typography>
            調査対象となる動画配信サービス (
            {videoPlatforms
              .map(({ id, name, url }) => (
                <Link key={id} href={url}>
                  {name}
                </Link>
              ))
              .map((item, index) => [index > 0 && "、", item])}
            ) でいつも通り動画をお楽しみください。
          </Typography>
          <Typography>
            動画再生時のビットレート・解像度・フレームレートなどの再生品質パラメーターを記録し、動画再生の体感品質を推定します。
          </Typography>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Box paddingTop={4} textAlign="center">
            <img src={dino} alt="dinoくん" width="300" />
          </Box>
        </Grid>
      </Grid>
    </Box>
  </>
);
