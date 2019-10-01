import React, { useState, useEffect } from "react";
import Button from "@material-ui/core/Button";
import SimplePage from "./js/components/SimplePage";
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
    <SimplePage title="以前のデータ形式に戻す">
      <Button setStated={doing} onClick={onClick}>
        {new Date(VERSION).toLocaleDateString()}
        より前のデータ形式に移行...
      </Button>
      {error && <ErrorSnackbar message={`移行に失敗しました。 (${error})`} />}
    </SimplePage>
  );
};
