import { useQuery } from "@apollo/client";
import React, { useEffect, useState } from "react";
import { ExchangeByIdDocument, Exchange } from "../generated/graphql";

interface ExchangeContext extends Partial<Exchange> {
  exchangeId: string;
  setExchangeId: (params: string) => void;
}
const ExchangeContext = React.createContext<ExchangeContext>({
  exchangeId: "",
  setExchangeId: () => {},
});

const ExchangeProvider: React.FC = ({ children }) => {
  const [exchangeId, setExchangeId] = useState<string>("");
  const { data } = useQuery(ExchangeByIdDocument, {
    variables: { _id: exchangeId },
    skip: !exchangeId,
  });

  useEffect(() => {
    const exchange = localStorage.getItem("exchangeId");
    if (!exchangeId && exchange) {
      setExchangeId(exchange);
    }
  }, [exchangeId]);

  return (
    <ExchangeContext.Provider value={{ exchangeId, setExchangeId, ...(data || {}).exchangeById }}>
      {children}
    </ExchangeContext.Provider>
  );
};

function useExchange() {
  const context = React.useContext(ExchangeContext);
  if (context === undefined) {
    throw new Error("useExchange must be used within a ExchangeProvider");
  }

  return context;
}

export { ExchangeProvider, useExchange };
