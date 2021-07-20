import {
  ApolloQueryResult,
  OperationVariables,
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
  setSkip: any;
  refetch: (
    variables?: Partial<OperationVariables> | undefined
  ) => Promise<ApolloQueryResult<GetMarketsQuery>>;
}

const MarketsContext = React.createContext<ContextMarkets>({
  markets: {},
  setSkip: () => {},
  refetch: async () => {
    return null as any;
  },
});

const MarketsProvider: React.FC = ({ children }) => {
  const { exchangeId, loading } = useExchange();
  const [priceMarket, setPriceMarket] = useState<Record<string, number>>({});
  const [skip, setSkip] = useState(loading);
  const { data: dataMore } = useSubscription<MarketHitSubscription>(
    MarketHitDocument,
    {
      fetchPolicy: "network-only",
      skip: !process.browser || skip || !exchangeId,
      variables: { exchangeId },
    }
  );

  const { data, refetch } = useQuery<GetMarketsQuery>(GetMarketsDocument, {
    skip: !exchangeId || !process.browser,
    fetchPolicy: "network-only",
    variables: { exchangeId },
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
    <MarketsContext.Provider
      value={{ markets: priceMarket || {}, setSkip, refetch }}
    >
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
      oldExchangeId.current === exchangeId;
    }
  }, [exchangeId]);

  if (skip) {
    return 0;
  }

  if (symbol) {
    return context.markets[symbol] || 0;
  }

  return context;
}

export { MarketsProvider, useMarket };
