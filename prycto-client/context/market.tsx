import { useQuery } from "@apollo/client";
import React, { useEffect, useState } from "react";
import { GetMarketsDocument, GetMarketsQuery } from "../generated/graphql";
import useSocket from "../hooks/useSocket";

export interface ContextMarkets {
  markets: Record<string, number>;
}

const MarketsContext = React.createContext<ContextMarkets>({
  markets: {},
});

const MarketsProvider: React.FC = ({ children }) => {
  const [priceMarket, setPriceMarket] = useState<Record<string, number>>({});
  const { data, subscribeToMore } = useQuery<GetMarketsQuery>(GetMarketsDocument)

  const { data: markets } = useSocket<ContextMarkets["markets"]>("getMarkets");
  useEffect(() => {
    setPriceMarket({ ...priceMarket, ...markets });
  }, [markets]);
  useEffect(() => {
    if (data) {
      setPriceMarket({ ...priceMarket, ...data.getMarkets });
    }
  }, [data]);
  useEffect(() => {
    // subscribeToMore();
  }, [])
  return (
    <MarketsContext.Provider value={{ markets: priceMarket || {} }}>
      {children}
    </MarketsContext.Provider>
  );
};

function useMarket(symbol?: string) {
  const context = React.useContext(MarketsContext);
  if (context === undefined) {
    throw new Error("useMarket must be used within a MarketProvider");
  }

  if (symbol) {
    return context.markets[symbol] || 0;
  }

  return context;
}

export { MarketsProvider, useMarket };
