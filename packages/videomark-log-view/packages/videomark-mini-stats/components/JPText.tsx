import * as React from "react";

// NOTE: to add css: @import url("https://fonts.googleapis.com/css?family=Noto+Sans+JP");
export const JPText: React.FC<React.SVGProps<SVGTextElement>> = props => (
  <text fontFamily="Noto Sans JP" {...props}></text>
);

export default JPText;
