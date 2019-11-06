import React, { useEffect, useRef } from "react";
import * as ReactDOM from "react-dom";
import ReactDOMServer from "react-dom/server";
import data from "./data.json";
import SVG from "../index";

const url = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
  ReactDOMServer.renderToString(<SVG data={data} />)
)}`;

function App() {
  const canvasRef = useRef<HTMLCanvasElement>();
  const imageRef = useRef<HTMLImageElement>();
  const anchorRef = useRef<HTMLAnchorElement>();

  useEffect(() => {
    const canvas = canvasRef.current;
    const image = imageRef.current;
    const anchor = anchorRef.current;

    canvas.width = image.width;
    canvas.height = image.height;
    canvas.getContext("2d").drawImage(image, 0, 0);

    anchor.download = new Date().toLocaleString();
    anchor.href = canvas.toDataURL();
  }, [canvasRef, imageRef]);

  return (
    <>
      <section>
        <h1>SVG</h1>
        <SVG data={data} />
      </section>
      <section>
        <h1>Image</h1>
        <img ref={imageRef} src={url} />
      </section>
      <section>
        <h1>Canvas</h1>
        <canvas ref={canvasRef} />
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
