import React, { createContext, useState, useEffect } from "react";
import { allViewings } from "../utils/ChromeExtensionWrapper";
import dataErase from "../utils/DataErase";
import ViewingModel from "../utils/Viewing";

export const ViewingsContext = createContext();
export const ViewingsProvider = props => {
  const [viewings, setViewings] = useState();
  useEffect(() => {
    new Promise(resolve => {
      if (document.readyState === "loading")
        document.addEventListener("DOMContentLoaded", resolve, { once: true });
      else resolve();
    })
      .then(() => allViewings())
      .then(data => dataErase.initialize(data))
      .then(setViewings);
  }, [setViewings]);
  return <ViewingsContext.Provider {...props} value={viewings} />;
};
export default ViewingsProvider;

export const viewingModelsStream = viewings => {
  const STREAM_BUFFER_SIZE = 120;
  const ids = [...viewings.keys()];
  const pull = async controller => {
    const buffer = await Promise.all(
      ids.splice(-STREAM_BUFFER_SIZE).map(async id => {
        const viewing = viewings.get(id);
        return viewing instanceof Function
          ? new ViewingModel(await viewing())
          : new ViewingModel(viewing);
      })
    );
    await Promise.all(buffer.map(viewingModel => viewingModel.init()));
    controller.enqueue(buffer);
  };
  return new ReadableStream({ pull });
};
