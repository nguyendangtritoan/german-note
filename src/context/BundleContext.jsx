import React, { createContext, useContext, useState } from 'react';

const BundleContext = createContext();

export const BundleProvider = ({ children }) => {
  // null = "Today" (default).
  // Otherwise = bundleId (e.g., "2023-10-26")
  const [activeBundleId, setActiveBundleId] = useState(null);

  return (
    <BundleContext.Provider value={{ activeBundleId, setActiveBundleId }}>
      {children}
    </BundleContext.Provider>
  );
};

export const useBundle = () => useContext(BundleContext);