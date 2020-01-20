import React from "react";
import PropTypes from "prop-types";
import Button from "@material-ui/core/Button";
import MuiDialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";

const Dialog = ({
  title,
  description,
  disagree,
  agree,
  open,
  onClose,
  onAgree
}) => (
  <MuiDialog open={open} onClose={onClose}>
    <DialogTitle>{title}</DialogTitle>
    <DialogContent>
      <DialogContentText>{description}</DialogContentText>
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose} color="primary">
        {disagree}
      </Button>
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
Dialog.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  disagree: PropTypes.string.isRequired,
  agree: PropTypes.string.isRequired,
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onAgree: PropTypes.func.isRequired
};
export default Dialog;
