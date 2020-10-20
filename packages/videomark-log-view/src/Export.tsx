import React, { useState } from "react";
import Button from "@material-ui/core/Button";
// @ts-expect-error ts-migrate(6142) FIXME: Module './js/components/SimplePage' was resolved t... Remove this comment to see the full error message
import SimplePage from "./js/components/SimplePage";
import { storage } from "./js/utils/ChromeExtensionWrapper";

export default () => {
  const [locked, lock] = useState(false);
  const onClick = async () => {
    lock(true);
    const entries = Object.entries(
      await new Promise((resolve) => storage().get(resolve))
    ).map(([key, value]) => `${JSON.stringify(key)}:${JSON.stringify(value)}`);
    const blob = new Blob(["{", entries.join(), "}"], {
      type: "data:application/json",
    });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `videomark-${Date.now()}.json`;
    a.click();
    lock(false);
  };
  return (
    // @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
    <SimplePage title="計測結果のエクスポート">
      {/* @ts-expect-error ts-migrate(17004) FIXME: Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message */}
      <Button disabled={locked} onClick={onClick}>
        JSONファイルにエクスポート...
      </Button>
    </SimplePage>
  );
};
