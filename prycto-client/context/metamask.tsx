import React, { useEffect, useRef, useState } from "react";

export interface ContextMetamask {
  account?: any;
  connect: () => Promise<void>;
  hasMetamask: boolean;
}

const MetamaskContext = React.createContext<ContextMetamask>({
  hasMetamask: false,
  connect: async () => {},
});

const MetamaskProvider: React.FC = ({ children }) => {
  const [address, setAddress] = useState<string>();
  const [hasMetamask, setHasMetamask] = useState(false);
  const connect = async () => {
    if (!address) {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      const account = accounts[0];
      setAddress(account);
    }
  };

  useEffect(() => {
    if (process.browser && window.ethereum) {
      setHasMetamask(true);
    }
  }, []);

  return (
    <MetamaskContext.Provider value={{ hasMetamask, connect }}>
      {children}
    </MetamaskContext.Provider>
  );
};

function useMetamask() {
  const context = React.useContext(MetamaskContext);

  return context;
}

export { MetamaskProvider, useMetamask };
