import React, { useState, useEffect } from "react";
import Grid from "@material-ui/core/Grid";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import CircularProgress from "@material-ui/core/CircularProgress";
import SimplePage from "./js/components/SimplePage";
import ErrorSnackbar from "./js/components/ErrorSnackbar";
import { isCurrentVersion, migration } from "./js/utils/ChromeExtensionWrapper";
import waitForContentRendering from "./js/utils/waitForContentRendering";

export const MigrationDialog = () => {
  const [error, setError] = useState(null);
  const [open, setOpen] = useState(false);
  const main = async () => {
    setError(null);
    try {
      if (await isCurrentVersion()) return;
      setOpen(true);
      // FIXME: storage へのアクセスは他のプロセスをブロックするので開始前に一定時間待つ
      await waitForContentRendering();
      await migration();
    } catch (e) {
      setError(e);
    }
    setOpen(false);
  };
  useEffect(() => {
    main();
  }, [setError, setOpen]);
  if (!open) return null;
  return (
    <>
      <Dialog open aria-labelledby="dialog-title">
        <DialogTitle id="dialog-title">最新のデータ形式に移行中...</DialogTitle>
        <Grid container justify="center" component={DialogContent}>
          <Grid item>
            <CircularProgress disableShrink />
          </Grid>
        </Grid>
      </Dialog>
      {error && <ErrorSnackbar message={`移行に失敗しました。 (${error})`} />}
    </>
  );
};

export default () => {
  const [open, setOpen] = useState(null);
  const onClick = () => setOpen(true);

  return (
    <SimplePage title="データの移行">
      <Button disabled={open} onClick={onClick}>
        最新のデータ形式に移行...
      </Button>
      {open && <MigrationDialog />}
    </SimplePage>
  );
};
