// ResultsContext.js
import React, { createContext, useState, ReactNode } from 'react';

// Create the context
export const ResultsContext = createContext<any>(null);

// Create a provider component
export const ResultsProvider = ({ children }: { children: ReactNode }) => {
  const [statistics, setStatistics] = useState({});

  return (
    <ResultsContext.Provider value={{ statistics, setStatistics }}>
      {children}
    </ResultsContext.Provider>
  );
};
