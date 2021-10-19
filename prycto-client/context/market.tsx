import {
  ApolloQueryResult,
  OperationVariables,
  useQuery,
} from "@apollo/client";
import React, { useEffect, useRef } from "react";
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
  const { exchangeId, exchange } = useExchange();
  const oldExchangeId = useRef();
  if (context === undefined) {
    throw new Error("useMarket must be used within a MarketProvider");
  }

  const {
    data,
    refetch,
    loading: loadingMarket,
    subscribeToMore,
    previousData,
  } = useQuery<GetMarketsQuery>(GetMarketsDocument, {
    skip: !exchangeId || !process.browser,
    variables: { exchangeId },
  });

  useEffect(() => {
    if (!previousData && subscribeToMore) {
      subscribeToMore<MarketHitSubscription>({
        document: MarketHitDocument,
        variables: { exchangeId },
        updateQuery: (prev, { subscriptionData }) => {
          return { ...prev, getMarkets: { ...prev.getMarkets, ...subscriptionData.data.marketHit } };
        },
      });
    }
  }, [previousData, exchangeId, subscribeToMore]);

  useEffect(() => {
    if (!oldExchangeId.current || oldExchangeId.current !== exchangeId) {
      oldExchangeId.current === exchangeId;
    }
  }, [exchangeId]);
  if (symbol) {
    return (data && data.getMarkets[symbol]) || 0;
  }

  return {
    ...context,
    markets: (data && data.getMarkets) || {},
    refetch,
    loading: loadingMarket,
  };
}

export { MarketsProvider, useMarket };
