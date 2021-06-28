import React, { useEffect, useState } from "react";

interface HideShowContext {
  isHide: boolean;
  setHide: (params: boolean) => void
}
const HideShowContext = React.createContext<HideShowContext>({ isHide: false, setHide: () => {} });

const HideShowProvider: React.FC = ({ children }) => {
  const [isHide, setHide] = useState<boolean>(false);
  
  return (
    <HideShowContext.Provider value={{ isHide, setHide }}>
      {children}
    </HideShowContext.Provider>
  );
};

function useHideShow() {
  const context = React.useContext(HideShowContext);
  if (context === undefined) {
    throw new Error("useHideShow must be used within a HideShowProvider");
  }

  return context;
}

export { HideShowProvider, useHideShow };
