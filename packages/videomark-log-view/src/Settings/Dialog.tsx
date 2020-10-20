import React from "react";
import Button from "@material-ui/core/Button";
import MuiDialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";

type Props = {
    title: string;
    description: string;
    disagree: string;
    agree: string;
    open: boolean;
    onClose: (...args: any[]) => any;
    onAgree: (...args: any[]) => any;
};

const Dialog = ({ title, description, disagree, agree, open, onClose, onAgree, }: Props) => (
  // @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
  <MuiDialog open={open} onClose={onClose}>
    {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
    <DialogTitle>{title}</DialogTitle>
    {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
    <DialogContent>
      {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
      <DialogContentText>{description}</DialogContentText>
    </DialogContent>
    {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
    <DialogActions>
      {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
      <Button onClick={onClose} color="primary">
        {disagree}
      </Button>
      {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
      <Button
        onClick={(...args) => {
          onAgree(...args);
          onClose(...args);
        }}
        color="secondary"
        autoFocus
      >
        {agree}
      </Button>
    </DialogActions>
  </MuiDialog>
);
export default Dialog;
