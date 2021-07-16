import { useApolloClient, useQuery } from "@apollo/client";
import React, { useEffect, useState } from "react";
import { ExchangeByIdDocument, Exchange } from "../generated/graphql";

interface ExchangeContext extends Partial<Exchange> {
  exchangeId: string;
  loading?: boolean;
  setExchangeId: (params: string) => void;
}
const ExchangeContext = React.createContext<ExchangeContext>({
  exchangeId: "",
  setExchangeId: () => {},
});

const ExchangeProvider: React.FC = ({ children }) => {
  const client = useApolloClient();
  const [exchangeId, setExchangeId] = useState<string>("");
  const { data, loading } = useQuery(ExchangeByIdDocument, {
    variables: { _id: exchangeId },
    skip: !exchangeId,
  });

  useEffect(() => {
    const exchange = localStorage.getItem("exchangeId");
    if (!exchangeId && exchange) {
      setExchangeId(exchange);
    }
  }, [exchangeId]);

  const handleSetExchange = (exchange: string) => {
    setExchangeId(exchange);
    localStorage.setItem("exchangeId", exchange);
  };

  useEffect(() => {
    if (exchangeId && !loading) {
      // client.resetStore();
    }
  }, [exchangeId, loading]);

  return (
    <ExchangeContext.Provider
      value={{
        exchangeId,
        loading,
        setExchangeId: handleSetExchange,
        ...(data || {}).exchangeById,
      }}
    >
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
