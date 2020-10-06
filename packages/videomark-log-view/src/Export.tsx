import React, { useState } from "react";
import Button from "@material-ui/core/Button";
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
    <SimplePage title="計測結果のエクスポート">
      <Button disabled={locked} onClick={onClick}>
        JSONファイルにエクスポート...
      </Button>
    </SimplePage>
  );
};
