import React, { createContext, useState, useEffect } from "react";
import { allViewings, migration } from "../utils/ChromeExtensionWrapper";
import dataErase from "../utils/DataErase";
import ViewingModel from "../utils/Viewing";
import waitForContentRendering from "../utils/waitForContentRendering";

export const ViewingsContext = createContext();
export const ViewingsProvider = props => {
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
export const viewingModelsStream = viewings => {
  const ids = [...viewings.keys()];
  const pull = async controller => {
    if (ids.length === 0) return controller.close();
    const buffer = await Promise.all(
      ids.splice(-STREAM_BUFFER_SIZE).map(async id => {
        const viewing = viewings.get(id);
        return viewing instanceof Function
          ? new ViewingModel({ id, ...(await viewing()) })
          : new ViewingModel({ id, ...viewing });
      })
    );
    await Promise.all(buffer.map(viewingModel => viewingModel.init()));
    return controller.enqueue(buffer);
  };
  return new ReadableStream({ pull });
};
