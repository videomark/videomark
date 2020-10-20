import * as React from "react";
// @ts-expect-error ts-migrate(7016) FIXME: Try `npm install @types/classnames` if it exists o... Remove this comment to see the full error message
import classNames from "classnames";
// @ts-expect-error ts-migrate(2307) FIXME: Cannot find module '../../../css/Modal.module.css'... Remove this comment to see the full error message
import style from "../../../css/Modal.module.css";
// @ts-expect-error ts-migrate(2307) FIXME: Cannot find module './times.svg' or its correspond... Remove this comment to see the full error message
import { ReactComponent as CrossIcon } from "./times.svg";

type OwnProps = {
    open: boolean;
    closeCallback?: (...args: any[]) => any;
};

type Props = OwnProps & typeof Modal.defaultProps;

class Modal extends React.Component<Props> {
  static defaultProps = {
      closeCallback: null,
  };

  handleKeyPress: any;

  render() {
    const { open, children, closeCallback } = this.props;
    return (
      // @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
      <div className={classNames(style.modal, { [style.open]: open })}>
        {/* eslint-disable jsx-a11y/control-has-associated-label */}
        {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
        <div
          className={style.modal_bg}
          // @ts-expect-error ts-migrate(2349) FIXME: Type 'never' has no call signatures.
          onClick={() => closeCallback && closeCallback()}
          onKeyPress={this.handleKeyPress}
          role="button"
          // @ts-expect-error ts-migrate(2322) FIXME: Type 'string' is not assignable to type 'number | ... Remove this comment to see the full error message
          tabIndex="0"
        />
        {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
        <div
          className={style.modal_close}
          // @ts-expect-error ts-migrate(2349) FIXME: Type 'never' has no call signatures.
          onClick={() => closeCallback && closeCallback()}
          onKeyPress={this.handleKeyPress}
          role="button"
          // @ts-expect-error ts-migrate(2322) FIXME: Type 'string' is not assignable to type 'number | ... Remove this comment to see the full error message
          tabIndex="0"
        >
          {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
          <CrossIcon />
        </div>
        {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
        <div className={style.modal_inner}>{children}</div>
      </div>
    );
  }
}

export default Modal;
