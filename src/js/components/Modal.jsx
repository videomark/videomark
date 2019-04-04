import * as React from "react";
import PropTypes from "prop-types";
import style from "../../css/Modal.module.css";
import { CrossIcon } from "./Icons";

class Modal extends React.Component {
  render() {
    const { children, closeCallback, className } = this.props;
    return (
      <div className={`${style.modal} ${className}`}>
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
  children: PropTypes.node.isRequired,
  closeCallback: PropTypes.func,
  className: PropTypes.string.isRequired
};

Modal.defaultProps = {
  closeCallback: null
};

export default Modal;
