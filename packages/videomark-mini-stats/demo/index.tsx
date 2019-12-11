import React, { useEffect, useRef } from "react";
import * as ReactDOM from "react-dom";
import ReactDOMServer from "react-dom/server";
import data from "./data.json";
import SVG from "../index";

const url = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
  ReactDOMServer.renderToString(<SVG data={data} />)
)}`;

function App() {
  const anchorRef = useRef<HTMLAnchorElement>();

  useEffect(() => {
    const image = new Image();
    image.src = url;
    image.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = image.width;
      canvas.height = image.height;
      canvas.getContext("2d").drawImage(image, 0, 0);

      const anchor = anchorRef.current;
      anchor.download = new Date().toLocaleString();
      anchor.href = canvas.toDataURL();
    };
  }, []);

  return (
    <>
      <section>
        <h1>JSON</h1>
        <pre>{JSON.stringify(data, null, 2)}</pre>
      </section>
      <section>
        <h1>SVG</h1>
        <SVG data={data} />
      </section>
      <section>
        <h1>URL</h1>
        <a ref={anchorRef} href={url}>
          Link
        </a>
      </section>
    </>
  );
}

ReactDOM.render(<App />, document.body.querySelector(".root"));
