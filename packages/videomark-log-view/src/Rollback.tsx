import React, { useState, useEffect } from "react";
import Button from "@material-ui/core/Button";
// @ts-expect-error ts-migrate(6142) FIXME: Module './js/components/SimplePage' was resolved t... Remove this comment to see the full error message
import SimplePage from "./js/components/SimplePage";
// @ts-expect-error ts-migrate(6142) FIXME: Module './js/components/ErrorSnackbar' was resolve... Remove this comment to see the full error message
import ErrorSnackbar from "./js/components/ErrorSnackbar";
import { VERSION, rollback } from "./js/utils/ChromeExtensionWrapper";
import waitForContentRendering from "./js/utils/waitForContentRendering";

export default () => {
  const [error, setError] = useState(null);
  const [doing, setState] = useState(false);
  const onClick = () => setState(true);
  const main = async () => {
    setError(null);
    try {
      if (doing) {
        // FIXME: storage へのアクセスは他のプロセスをブロックするので開始前に一定時間待つ
        await waitForContentRendering();
        await rollback();
      }
    } catch (e) {
      setError(e);
    }
    setState(false);
  };
  useEffect(() => {
    main();
  }, [setError, setState, doing]);

  return (
    // @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
    <SimplePage title="以前のデータ形式に戻す">
      {/* @ts-expect-error ts-migrate(2769) FIXME: Property 'setStated' does not exist on type 'Intri... Remove this comment to see the full error message */}
      <Button setStated={doing} onClick={onClick}>
        {new Date(VERSION).toLocaleDateString()}
        より前のデータ形式に移行...
      </Button>
      {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
      {error && <ErrorSnackbar message={`移行に失敗しました。 (${error})`} />}
    </SimplePage>
  );
};
