import React, { useState, useEffect } from "react";
import Grid from "@material-ui/core/Grid";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import CircularProgress from "@material-ui/core/CircularProgress";
// @ts-expect-error ts-migrate(6142) FIXME: Module './js/components/SimplePage' was resolved t... Remove this comment to see the full error message
import SimplePage from "./js/components/SimplePage";
// @ts-expect-error ts-migrate(6142) FIXME: Module './js/components/ErrorSnackbar' was resolve... Remove this comment to see the full error message
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
    // @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
    <>
      {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
      <Dialog open aria-labelledby="dialog-title">
        {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
        <DialogTitle id="dialog-title">最新のデータ形式に移行中...</DialogTitle>
        {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
        <Grid container justify="center" component={DialogContent}>
          {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
          <Grid item>
            {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
            <CircularProgress disableShrink />
          </Grid>
        </Grid>
      </Dialog>
      {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
      {error && <ErrorSnackbar message={`移行に失敗しました。 (${error})`} />}
    </>
  );
};

export default () => {
  const [open, setOpen] = useState(null);
  // @ts-expect-error ts-migrate(2345) FIXME: Argument of type 'true' is not assignable to param... Remove this comment to see the full error message
  const onClick = () => setOpen(true);

  return (
    // @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
    <SimplePage title="データの移行">
      {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
      <Button disabled={open} onClick={onClick}>
        最新のデータ形式に移行...
      </Button>
      {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
      {open && <MigrationDialog />}
    </SimplePage>
  );
};
