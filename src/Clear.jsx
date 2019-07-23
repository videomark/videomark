import React from "react";
import Button from "@material-ui/core/Button";
import SimplePage from "./js/components/SimplePage";
import { clearStore } from "./js/containers/StatsDataProvider";

export default () => {
  return (
    <SimplePage title="キャッシュの削除">
      <Button onClick={() => clearStore()}>
        計測結果のキャッシュを削除...
      </Button>
    </SimplePage>
  );
};
