import * as React from "react";
import PropTypes from "prop-types";
import classNames from "classnames";
import style from "../../../css/Modal.module.css";
import { ReactComponent as CrossIcon } from "./times.svg";

class Modal extends React.Component {
  render() {
    const { open, children, closeCallback } = this.props;
    return (
      <div className={classNames(style.modal, { [style.open]: open })}>
        {/* eslint-disable jsx-a11y/control-has-associated-label */}
        <div
          className={style.modal_bg}
          onClick={() => closeCallback && closeCallback()}
          onKeyPress={this.handleKeyPress}
          role="button"
          tabIndex="0"
        />
        <div
          className={style.modal_close}
          onClick={() => closeCallback && closeCallback()}
          onKeyPress={this.handleKeyPress}
          role="button"
          tabIndex="0"
        >
          <CrossIcon />
        </div>
        <div className={style.modal_inner}>{children}</div>
      </div>
    );
  }
}

Modal.propTypes = {
  open: PropTypes.bool.isRequired,
  children: PropTypes.node.isRequired,
  closeCallback: PropTypes.func,
};

Modal.defaultProps = {
  closeCallback: null,
};

export default Modal;
