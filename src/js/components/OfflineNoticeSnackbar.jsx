import React, { Component } from "react";
import Snackbar from "@material-ui/core/Snackbar";
import SnackbarContent from "@material-ui/core/SnackbarContent";
import IconButton from "@material-ui/core/IconButton";
import Refresh from "@material-ui/icons/Refresh";

class OfflineNoticeSnackbar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false,
      message:
        "現在オフラインです。最新の計測結果を取得するには再接続してください。"
    };
    this.open = this.open.bind(this);
    this.close = this.close.bind(this);
  }

  componentDidMount() {
    if (!window.navigator.onLine) this.open();
    window.addEventListener("offline", this.open);
  }

  componentWillUnmount() {
    window.removeEventListener("offline", this.open);
  }

  open() {
    this.setState({ open: true });
  }

  close() {
    this.setState({ open: false });
  }

  render() {
    const { open, message } = this.state;
    return (
      <Snackbar open={open} onClose={this.close}>
        <SnackbarContent
          message={<span id="message-id">{message}</span>}
          action={[
            <IconButton
              key="refresh"
              aria-label="Refresh"
              color="inherit"
              onClick={() => window.location.reload()}
            >
              <Refresh />
            </IconButton>
          ]}
        />
      </Snackbar>
    );
  }
}

export default OfflineNoticeSnackbar;
