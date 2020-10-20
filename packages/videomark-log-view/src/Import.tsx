import React, { useState } from "react";
import Typography from "@material-ui/core/Typography";
// @ts-expect-error ts-migrate(6142) FIXME: Module './js/components/SimplePage' was resolved t... Remove this comment to see the full error message
import SimplePage from "./js/components/SimplePage";
import {
  storage,
  migration,
  rollback,
} from "./js/utils/ChromeExtensionWrapper";

export default () => {
  const [errorMessage, setErrorMessage] = useState(null);
  const [locked, lock] = useState(false);
  const onChange = async (e: any) => {
    const { files } = e.currentTarget;
    if (files.length !== 1) return;
    setErrorMessage(null);
    lock(true);
    const [file] = files;
    const result = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (rogressEvent) => {
        try {
          // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
          const json = JSON.parse(rogressEvent.target.result);
          if (!(json.AgreedTerm || json.RemovedTargetKeys))
            throw new Error("invalid format");
          resolve(json);
        } catch (error) {
          reject(error);
        }
      };
      reader.readAsText(file);
    }).catch((error) =>
      // @ts-expect-error ts-migrate(2345) FIXME: Argument of type 'string' is not assignable to par... Remove this comment to see the full error message
      setErrorMessage(`インポートに失敗しました。 (${error})`)
    );
    await rollback();
    await new Promise((resolve) => storage().set(result, resolve));
    await migration();
    lock(false);
  };
  return (
    // @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
    <SimplePage title="計測結果のインポート">
      {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
      <input
        disabled={locked}
        type="file"
        accept="application/json"
        onChange={onChange}
      />
      {errorMessage && (
        // @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
        <Typography color="secondary">{errorMessage}</Typography>
      )}
    </SimplePage>
  );
};
