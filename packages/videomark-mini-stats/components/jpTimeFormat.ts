import { floor } from "./math";

export const jpTimeFormat = (milliseconds: number) =>
{
  const minutes = milliseconds / 60e3;
  return [
    minutes > 60
      ? `${floor(minutes / 60).toLocaleString()}時間`
      : "",
    `${floor(minutes % 60)}分`
  ].join("")
  }
export default jpTimeFormat
