import React, { useCallback } from "react";
import * as ReactDOM from "react-dom";
import data from "./data.json";
import SVG, { shareOrDownload } from "../index";

function App() {
  const actionHandler = useCallback(() => {
    shareOrDownload(data);
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
        <h1>Action</h1>
        <input
          name="action"
          type="button"
          value="Share or Download"
          onClick={actionHandler}
        />
      </section>
    </>
  );
}

ReactDOM.render(<App />, document.body.querySelector(".root"));
