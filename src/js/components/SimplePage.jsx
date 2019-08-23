import React from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import CssBaseline from "@material-ui/core/CssBaseline";
import Container from "@material-ui/core/Container";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import ArrowBack from "@material-ui/icons/ArrowBack";

const SimplePage = ({ title, ...props }) => (
  <Container>
    <CssBaseline />
    <Grid container justify="center" spacing={2}>
      <Grid item xs={12}>
        <Typography component="h1" variant="h5" align="center">
          {title}
        </Typography>
        <Button component={Link} to="/">
          <ArrowBack />
          トップに戻る
        </Button>
      </Grid>
      {/* eslint-disable-next-line react/jsx-props-no-spreading */}
      <Grid item {...props} />
    </Grid>
  </Container>
);
SimplePage.propTypes = {
  title: PropTypes.string.isRequired
};

export default SimplePage;
