import React, { useState, useEffect } from "react";
import { withRouter } from "react-router-dom";
import Button from "@material-ui/core/Button";
import SimplePage from "./js/components/SimplePage";
import ErrorSnackbar from "./js/components/ErrorSnackbar";
import { VERSION, rollback } from "./js/utils/ChromeExtensionWrapper";

export default withRouter(() => {
  const [error, setError] = useState(null);
  const [doing, setState] = useState(false);
  const onClick = () => setState(true);
  const main = async () => {
    setError(null);
    try {
      if (doing) await rollback();
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
});
