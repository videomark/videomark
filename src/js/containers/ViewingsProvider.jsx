import React, { createContext, useState, useEffect } from "react";
import { allViewings } from "../utils/ChromeExtensionWrapper";
import dataErase from "../utils/DataErase";

export const ViewingsContext = createContext();
export const ViewingsProvider = props => {
  const [viewings, setViewings] = useState();
  useEffect(() => {
    allViewings()
      .then(data => dataErase.initialize(data))
      .then(setViewings);
  }, [setViewings]);
  return <ViewingsContext.Provider {...props} value={viewings} />;
};
export default ViewingsProvider;
