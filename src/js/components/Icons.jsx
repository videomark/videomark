import * as React from "react";
import PropTypes from "prop-types";
import helpIcon from "../../images/help.png";
import style from "../../css/Icons.module.css";
import refresh from "../../images/refresh.svg";
import times from "../../images/times.svg";

export const Refresh = () => {
  return <img src={refresh} alt="refresh" />;
};

export const CrossIcon = () => {
  return <img src={times} alt="close" />;
};

export const ArrowRight = props => {
  const { className } = props;
  return (
    <div className={className}>
      <svg
        height="42px"
        id="Layer_1"
        version="1.1"
        viewBox="0 0 512 512"
        width="42px"
      >
        <polygon points="160,128.4 192.3,96 352,256 352,256 352,256 192.3,416 160,383.6 287.3,256 " />
      </svg>
    </div>
  );
};

ArrowRight.propTypes = {
  className: PropTypes.string
};

ArrowRight.defaultProps = {
  className: ""
};

export const ArrowLeft = props => {
  const { className } = props;
  return (
    <div className={className}>
      <svg
        height="42px"
        id="Layer_1"
        version="1.1"
        viewBox="0 0 512 512"
        width="42px"
      >
        <polygon points="352,128.4 319.7,96 160,256 160,256 160,256 319.7,416 352,383.6 224.7,256 " />
      </svg>
    </div>
  );
};

ArrowLeft.propTypes = {
  className: PropTypes.string
};

ArrowLeft.defaultProps = {
  className: ""
};

export const Help = () => {
  return <img src={helpIcon} alt="help-icon" className={style.help} />;
};
