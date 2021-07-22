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
  loading: boolean;
  refetch: (
    variables?: Partial<OperationVariables> | undefined
  ) => Promise<ApolloQueryResult<GetMarketsQuery>>;
}

const MarketsContext = React.createContext<ContextMarkets>({
  markets: {},
  loading: true,
  refetch: async () => {
    return null as any;
  },
});

const MarketsProvider: React.FC = ({ children }) => {
  return (
    <MarketsContext.Provider
      value={{
        markets: {},
        loading: true,
        refetch: async () => {
          return null as any;
        },
      }}
    >
      {children}
    </MarketsContext.Provider>
  );
};

function useMarket(symbol?: string) {
  const context = React.useContext(MarketsContext);
  const { exchangeId, loading } = useExchange();
  const oldExchangeId = useRef();
  if (context === undefined) {
    throw new Error("useMarket must be used within a MarketProvider");
  }

  const [priceMarket, setPriceMarket] = useState<Record<string, number>>({});
  // const [skipState, setSkip] = useState(loading);
  const { data: dataMore } = useSubscription<MarketHitSubscription>(
    MarketHitDocument,
    {
      // fetchPolicy: "network-only",
      skip: !process.browser || !exchangeId,
      variables: { exchangeId },
    }
  );

  const { data, refetch, loading: loadingMarket } = useQuery<GetMarketsQuery>(GetMarketsDocument, {
    skip: !exchangeId || !process.browser,
    // fetchPolicy: "network-only",
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

  useEffect(() => {
    if (!oldExchangeId.current || oldExchangeId.current !== exchangeId) {
      oldExchangeId.current === exchangeId;
    }
  }, [exchangeId]);

  if (symbol) {
    return priceMarket[symbol] || 0;
  }

  return { ...context, markets: priceMarket, refetch, loading: loadingMarket };
}

export { MarketsProvider, useMarket };
