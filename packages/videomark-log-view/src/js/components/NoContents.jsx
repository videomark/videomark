import React from "react";
import Box from "@material-ui/core/Box";
import Typography from "@material-ui/core/Typography";

const NoContents = () => {
  return (
    <Box paddingTop={2} paddingBottom={2} width={1}>
      <Typography component="h2" variant="h6" align="center">
        該当する計測結果がありません
      </Typography>
    </Box>
  );
};
export default NoContents;
