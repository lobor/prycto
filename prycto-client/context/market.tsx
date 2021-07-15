import {
  useQuery,
  useSubscription,
} from "@apollo/client";
import React, { useEffect, useRef, useState } from "react";
import {
  GetMarketsDocument,
  GetMarketsQuery,
  MarketHitDocument,
  MarketHitSubscription,
} from "../generated/graphql";
import { useExchange } from "./exchange";

export interface ContextMarkets {
  markets: Record<string, number>;
  setSkip: React.Dispatch<React.SetStateAction<boolean>>;
}

const MarketsContext = React.createContext<ContextMarkets>({
  markets: {},
  setSkip: () => {},
});

const MarketsProvider: React.FC = ({ children }) => {
  const { exchangeId } = useExchange();
  const [priceMarket, setPriceMarket] = useState<Record<string, number>>({});
  const [skip, setSkip] = useState(false);
  const { data: dataMore } = useSubscription<MarketHitSubscription>(
    MarketHitDocument,
    {
      fetchPolicy: "network-only",
      skip: !process.browser || skip || !exchangeId,
      variables: { exchangeId },
    }
  );

  const { data } = useQuery<GetMarketsQuery>(GetMarketsDocument, {
    skip: !exchangeId || !process.browser,
    fetchPolicy: "network-only",
  });

  useEffect(() => {
    if (data) {
      setPriceMarket({ ...priceMarket, ...data.getMarkets });
    }
  }, [data]);
  useEffect(() => {
    if (dataMore) {
      setPriceMarket({ ...priceMarket, ...dataMore.marketHit });
    }
  }, [dataMore]);

  return (
    <MarketsContext.Provider value={{ markets: priceMarket || {}, setSkip }}>
      {children}
    </MarketsContext.Provider>
  );
};

function useMarket(symbol?: string, { skip = false } = {}) {
  const context = React.useContext(MarketsContext);
  const { exchangeId } = useExchange();
  const oldExchangeId = useRef();
  if (context === undefined) {
    throw new Error("useMarket must be used within a MarketProvider");
  }

  useEffect(() => {
    context.setSkip(skip);
  }, [skip]);

  useEffect(() => {
    if (!oldExchangeId.current || oldExchangeId.current !== exchangeId) {
      oldExchangeId.current === exchangeId
    }
  }, [exchangeId])

  if (skip) {
    return 0;
  }

  if (symbol) {
    return context.markets[symbol] || 0;
  }

  return context;
}

export { MarketsProvider, useMarket };
