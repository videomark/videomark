import React from "react";
import PropTypes from "prop-types";
import { styled } from "@material-ui/styles";
import Container from "@material-ui/core/Container";
import Box from "@material-ui/core/Box";
import AppBar from "@material-ui/core/AppBar";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import Paper from "@material-ui/core/Paper";
import MuiList from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import MuiListItemText from "@material-ui/core/ListItemText";
import Divider from "@material-ui/core/Divider";
import ThemeProvider from "./js/components/ThemeProvider";
import { clearStore } from "./js/containers/StatsDataProvider";

const List = styled(MuiList)({
  padding: 0
});

const ListItemText = props => {
  const { primary: text, disabled } = props;
  const primary = disabled ? (
    <Typography color="textSecondary">{text}</Typography>
  ) : (
    text
  );
  return <MuiListItemText {...props} primary={primary} />;
};
ListItemText.propTypes = {
  primary: PropTypes.node.isRequired,
  disabled: PropTypes.bool
};
ListItemText.defaultProps = {
  disabled: false
};

const Header = () => (
  <AppBar color="default">
    <Box
      height={48}
      component={Grid}
      container
      alignItems="center"
      justify="center"
    >
      <Grid item>
        <Typography component="h1" variant="h6">
          設定
        </Typography>
      </Grid>
    </Box>
  </AppBar>
);

const PrivacySettings = () => (
  <Box marginY={4}>
    <Box marginY={1}>
      <Typography component="h3" variant="body1">
        プライバシー
      </Typography>
    </Box>
    <Paper>
      <List>
        <ListItem>
          <ListItemText primary="セッションID" secondary="未設定" />
        </ListItem>
        <Divider component="li" />
        <ListItem>
          <ListItemText
            primary="セッション保持期間"
            secondary="新しいページを読み込むまで"
          />
        </ListItem>
        <Divider component="li" />
        <ListItem>
          <ListItemText primary="セッションIDのリセット" disabled />
        </ListItem>
        <Divider component="li" />
        <ListItem button onClick={() => clearStore()}>
          <ListItemText primary="統計グラフのキャッシュを削除..." />
        </ListItem>
      </List>
    </Paper>
  </Box>
);

const Reset = () => {
  return (
    <Box marginY={4}>
      <Box marginY={1}>
        <Typography component="h3" variant="body1">
          設定のリセット
        </Typography>
      </Box>
      <Paper>
        <List>
          <ListItem>
            <ListItemText primary="初期設定に戻す" disabled />
          </ListItem>
        </List>
      </Paper>
    </Box>
  );
};

export default () => (
  <ThemeProvider>
    <Header />
    <Box paddingTop={6}>
      <Container maxWidth="sm">
        <PrivacySettings />
        <Reset />
      </Container>
    </Box>
  </ThemeProvider>
);
