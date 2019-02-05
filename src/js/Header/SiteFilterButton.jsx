import * as React from "react";
import PropTypes from "prop-types";
import { Button } from "@material-ui/core";
import style from "../../css/Header.module.css";

const siteFilterButton = props => {
  const { callback, service, enabled } = props;
  return (
    <Button
      variant="contained"
      color="default"
      onClick={callback}
      className={enabled ? "" : `${style.siteIconDisabled}`}
    >
      {service}
    </Button>
  );
};

siteFilterButton.propTypes = {
  callback: PropTypes.func.isRequired,
  service: PropTypes.string.isRequired,
  enabled: PropTypes.bool.isRequired
};

export default siteFilterButton;
