import React, { createContext, useState, useEffect } from "react";
import { allViewings, migration } from "../utils/ChromeExtensionWrapper";
import dataErase from "../utils/DataErase";
import ViewingModel from "../utils/Viewing";
import waitForContentRendering from "../utils/waitForContentRendering";

export const ViewingsContext = createContext();
export const ViewingsProvider = (props) => {
  const [viewings, setViewings] = useState();
  const main = async () => {
    // FIXME: storage へのアクセスは他のプロセスをブロックするので開始前に一定時間待つ
    await waitForContentRendering();
    await migration();
    const data = await allViewings();
    setViewings(await dataErase.initialize(data));
  };
  useEffect(() => {
    main();
  }, [setViewings]);

  // eslint-disable-next-line react/jsx-props-no-spreading
  return <ViewingsContext.Provider {...props} value={viewings} />;
};
export default ViewingsProvider;

export const STREAM_BUFFER_SIZE = 60;
export const viewingModelsStream = (viewings) => {
  const ids = [...viewings.keys()];
  const pull = async (controller) => {
    if (ids.length === 0) {
      controller.close();
      return;
    }

    const buffer = await Promise.all(
      ids.splice(-STREAM_BUFFER_SIZE).map(async (id) => {
        const viewing = viewings.get(id);
        const initialState =
          viewing instanceof Function ? await viewing() : viewing;
        return new ViewingModel({
          id,
          ...initialState,
        }).init();
      })
    );

    const filtered = buffer.filter(({ valid }) => valid);
    const invalid = buffer.filter(({ valid }) => !valid);
    if (invalid.length > 0) dataErase.add(...invalid.map(({ id }) => id));
    controller.enqueue(filtered);
  };
  return new ReadableStream({ pull });
};
