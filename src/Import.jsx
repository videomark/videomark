import React, { useState } from "react";
import Typography from "@material-ui/core/Typography";
import SimplePage from "./js/components/SimplePage";
import {
  storage,
  migration,
  rollback
} from "./js/utils/ChromeExtensionWrapper";

export default () => {
  const [errorMessage, setErrorMessage] = useState(null);
  const [locked, lock] = useState(false);
  const onChange = async e => {
    const { files } = e.currentTarget;
    if (files.length !== 1) return;
    setErrorMessage(null);
    lock(true);
    const [file] = files;
    const result = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = rogressEvent => {
        try {
          const json = JSON.parse(rogressEvent.target.result);
          if (!(json.AgreedTerm || json.RemovedTargetKeys))
            throw new Error("invalid format");
          resolve(json);
        } catch (error) {
          reject(error);
        }
      };
      reader.readAsText(file);
    }).catch(error => setErrorMessage(`インポートに失敗しました。 (${error})`));
    await rollback();
    await new Promise(resolve => storage().set(result, resolve));
    await migration();
    lock(false);
  };
  return (
    <SimplePage title="計測結果のインポート">
      <input
        disabled={locked}
        type="file"
        accept="application/json"
        onChange={onChange}
      />
      {errorMessage && (
        <Typography color="secondary">{errorMessage}</Typography>
      )}
    </SimplePage>
  );
};
