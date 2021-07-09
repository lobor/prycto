import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
export type Maybe<T> = T | null;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  /** The `JSON` scalar type represents JSON values as specified by [ECMA-404](http://www.ecma-international.org/publications/files/ECMA-ST/ECMA-404.pdf). */
  JSON: any;
};

export type Cours = {
  __typename?: 'Cours';
  _id: Scalars['ID'];
  symbol: Scalars['String'];
  exchangeId: Scalars['String'];
  timestamp: Scalars['Float'];
  open: Scalars['Float'];
  hight: Scalars['Float'];
  low: Scalars['Float'];
  close: Scalars['Float'];
  volume: Scalars['Float'];
};

export type Exchange = {
  __typename?: 'Exchange';
  _id: Scalars['ID'];
  exchange: Scalars['String'];
  name: Scalars['String'];
  publicKey: Scalars['String'];
  secretKey: Scalars['String'];
  balance: Scalars['JSON'];
};


export type Mutation = {
  __typename?: 'Mutation';
  addExchange: Exchange;
  removeExchange: Scalars['Boolean'];
  removePosition: Scalars['Boolean'];
  editPosition: Position;
  syncPositions: Position;
  addPosition: Position;
};


export type MutationAddExchangeArgs = {
  name: Scalars['String'];
  exchange: Scalars['String'];
  publicKey: Scalars['String'];
  secretKey: Scalars['String'];
};


export type MutationRemoveExchangeArgs = {
  _id: Scalars['String'];
};


export type MutationRemovePositionArgs = {
  _id: Scalars['String'];
};


export type MutationEditPositionArgs = {
  objectif: Scalars['Float'];
  _id: Scalars['String'];
};


export type MutationSyncPositionsArgs = {
  _id: Scalars['String'];
};


export type MutationAddPositionArgs = {
  symbol: Scalars['String'];
};

export type Pair = {
  __typename?: 'Pair';
  symbol: Scalars['String'];
};

export type Position = {
  __typename?: 'Position';
  _id: Scalars['ID'];
  pair: Scalars['String'];
  investment: Scalars['Float'];
  exchangeId: Scalars['String'];
  objectif?: Maybe<Scalars['Float']>;
  available?: Maybe<Scalars['Float']>;
  locked?: Maybe<Scalars['Float']>;
  balance: Scalars['JSON'];
};

export type Query = {
  __typename?: 'Query';
  exchangeById: Exchange;
  exchanges: Array<Exchange>;
  hasInit1: Scalars['Boolean'];
  positions: Array<Position>;
  position: Position;
  getMarkets: Scalars['JSON'];
  getPairs: Array<Pair>;
  getHistoryBySymbol: Array<Cours>;
};


export type QueryExchangeByIdArgs = {
  _id: Scalars['String'];
};


export type QueryPositionArgs = {
  _id: Scalars['String'];
};


export type QueryGetHistoryBySymbolArgs = {
  limit?: Maybe<Scalars['Int']>;
  symbol: Scalars['String'];
};

export type Subscription = {
  __typename?: 'Subscription';
  marketHit: Scalars['JSON'];
};

export type AddExchangeMutationVariables = Exact<{
  name: Scalars['String'];
  exchange: Scalars['String'];
  publicKey: Scalars['String'];
  secretKey: Scalars['String'];
}>;


export type AddExchangeMutation = (
  { __typename?: 'Mutation' }
  & { addExchange: (
    { __typename?: 'Exchange' }
    & Pick<Exchange, 'name' | 'exchange' | 'publicKey' | 'secretKey' | '_id'>
  ) }
);

export type AddPositionMutationVariables = Exact<{
  symbol: Scalars['String'];
}>;


export type AddPositionMutation = (
  { __typename?: 'Mutation' }
  & { addPosition: (
    { __typename?: 'Position' }
    & Pick<Position, '_id' | 'pair' | 'investment' | 'objectif'>
  ) }
);

export type EditPositionMutationVariables = Exact<{
  _id: Scalars['String'];
  objectif: Scalars['Float'];
}>;


export type EditPositionMutation = (
  { __typename?: 'Mutation' }
  & { editPosition: (
    { __typename?: 'Position' }
    & Pick<Position, '_id' | 'objectif'>
  ) }
);

export type ExchangeByIdQueryVariables = Exact<{
  _id: Scalars['String'];
}>;


export type ExchangeByIdQuery = (
  { __typename?: 'Query' }
  & { exchangeById: (
    { __typename?: 'Exchange' }
    & Pick<Exchange, 'name' | '_id'>
  ) }
);

export type ExchangesQueryVariables = Exact<{ [key: string]: never; }>;


export type ExchangesQuery = (
  { __typename?: 'Query' }
  & { exchanges: Array<(
    { __typename?: 'Exchange' }
    & Pick<Exchange, 'name' | '_id'>
  )> }
);

export type GetHistoryBySymbolQueryVariables = Exact<{
  symbol: Scalars['String'];
  limit?: Maybe<Scalars['Int']>;
}>;


export type GetHistoryBySymbolQuery = (
  { __typename?: 'Query' }
  & { getHistoryBySymbol: Array<(
    { __typename?: 'Cours' }
    & Pick<Cours, '_id' | 'timestamp' | 'close'>
  )> }
);

export type GetMarketsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetMarketsQuery = (
  { __typename?: 'Query' }
  & Pick<Query, 'getMarkets'>
);

export type GetPairsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetPairsQuery = (
  { __typename?: 'Query' }
  & { getPairs: Array<(
    { __typename?: 'Pair' }
    & Pick<Pair, 'symbol'>
  )> }
);

export type MarketHitSubscriptionVariables = Exact<{ [key: string]: never; }>;


export type MarketHitSubscription = (
  { __typename?: 'Subscription' }
  & Pick<Subscription, 'marketHit'>
);

export type PositionQueryVariables = Exact<{
  _id: Scalars['String'];
}>;


export type PositionQuery = (
  { __typename?: 'Query' }
  & { position: (
    { __typename?: 'Position' }
    & Pick<Position, '_id' | 'pair' | 'exchangeId' | 'available' | 'locked' | 'investment' | 'objectif' | 'balance'>
  ) }
);

export type PositionsQueryVariables = Exact<{ [key: string]: never; }>;


export type PositionsQuery = (
  { __typename?: 'Query' }
  & { positions: Array<(
    { __typename?: 'Position' }
    & Pick<Position, '_id' | 'pair' | 'exchangeId' | 'available' | 'locked' | 'investment' | 'objectif'>
  )> }
);

export type RemoveExchangeMutationVariables = Exact<{
  _id: Scalars['String'];
}>;


export type RemoveExchangeMutation = (
  { __typename?: 'Mutation' }
  & Pick<Mutation, 'removeExchange'>
);

export type RemovePositionMutationVariables = Exact<{
  _id: Scalars['String'];
}>;


export type RemovePositionMutation = (
  { __typename?: 'Mutation' }
  & Pick<Mutation, 'removePosition'>
);

export type SyncPositionsMutationVariables = Exact<{
  _id: Scalars['String'];
}>;


export type SyncPositionsMutation = (
  { __typename?: 'Mutation' }
  & { syncPositions: (
    { __typename?: 'Position' }
    & Pick<Position, '_id'>
  ) }
);


export const AddExchangeDocument = gql`
    mutation addExchange($name: String!, $exchange: String!, $publicKey: String!, $secretKey: String!) {
  addExchange(
    name: $name
    exchange: $exchange
    publicKey: $publicKey
    secretKey: $secretKey
  ) {
    name
    exchange
    publicKey
    secretKey
    _id
  }
}
    `;
export type AddExchangeMutationFn = Apollo.MutationFunction<AddExchangeMutation, AddExchangeMutationVariables>;
export type AddExchangeMutationResult = Apollo.MutationResult<AddExchangeMutation>;
export type AddExchangeMutationOptions = Apollo.BaseMutationOptions<AddExchangeMutation, AddExchangeMutationVariables>;
export const AddPositionDocument = gql`
    mutation addPosition($symbol: String!) {
  addPosition(symbol: $symbol) {
    _id
    pair
    investment
    objectif
  }
}
    `;
export type AddPositionMutationFn = Apollo.MutationFunction<AddPositionMutation, AddPositionMutationVariables>;
export type AddPositionMutationResult = Apollo.MutationResult<AddPositionMutation>;
export type AddPositionMutationOptions = Apollo.BaseMutationOptions<AddPositionMutation, AddPositionMutationVariables>;
export const EditPositionDocument = gql`
    mutation editPosition($_id: String!, $objectif: Float!) {
  editPosition(_id: $_id, objectif: $objectif) {
    _id
    objectif
  }
}
    `;
export type EditPositionMutationFn = Apollo.MutationFunction<EditPositionMutation, EditPositionMutationVariables>;
export type EditPositionMutationResult = Apollo.MutationResult<EditPositionMutation>;
export type EditPositionMutationOptions = Apollo.BaseMutationOptions<EditPositionMutation, EditPositionMutationVariables>;
export const ExchangeByIdDocument = gql`
    query exchangeById($_id: String!) {
  exchangeById(_id: $_id) {
    name
    _id
  }
}
    `;
export type ExchangeByIdQueryResult = Apollo.QueryResult<ExchangeByIdQuery, ExchangeByIdQueryVariables>;
export const ExchangesDocument = gql`
    query exchanges {
  exchanges {
    name
    _id
  }
}
    `;
export type ExchangesQueryResult = Apollo.QueryResult<ExchangesQuery, ExchangesQueryVariables>;
export const GetHistoryBySymbolDocument = gql`
    query getHistoryBySymbol($symbol: String!, $limit: Int) {
  getHistoryBySymbol(symbol: $symbol, limit: $limit) {
    _id
    timestamp
    close
  }
}
    `;
export type GetHistoryBySymbolQueryResult = Apollo.QueryResult<GetHistoryBySymbolQuery, GetHistoryBySymbolQueryVariables>;
export const GetMarketsDocument = gql`
    query getMarkets {
  getMarkets
}
    `;
export type GetMarketsQueryResult = Apollo.QueryResult<GetMarketsQuery, GetMarketsQueryVariables>;
export const GetPairsDocument = gql`
    query getPairs {
  getPairs {
    symbol
  }
}
    `;
export type GetPairsQueryResult = Apollo.QueryResult<GetPairsQuery, GetPairsQueryVariables>;
export const MarketHitDocument = gql`
    subscription marketHit {
  marketHit
}
    `;
export type MarketHitSubscriptionResult = Apollo.SubscriptionResult<MarketHitSubscription>;
export const PositionDocument = gql`
    query position($_id: String!) {
  position(_id: $_id) {
    _id
    pair
    exchangeId
    available
    locked
    investment
    objectif
    balance
  }
}
    `;
export type PositionQueryResult = Apollo.QueryResult<PositionQuery, PositionQueryVariables>;
export const PositionsDocument = gql`
    query positions {
  positions {
    _id
    pair
    exchangeId
    available
    locked
    investment
    objectif
  }
}
    `;
export type PositionsQueryResult = Apollo.QueryResult<PositionsQuery, PositionsQueryVariables>;
export const RemoveExchangeDocument = gql`
    mutation removeExchange($_id: String!) {
  removeExchange(_id: $_id)
}
    `;
export type RemoveExchangeMutationFn = Apollo.MutationFunction<RemoveExchangeMutation, RemoveExchangeMutationVariables>;
export type RemoveExchangeMutationResult = Apollo.MutationResult<RemoveExchangeMutation>;
export type RemoveExchangeMutationOptions = Apollo.BaseMutationOptions<RemoveExchangeMutation, RemoveExchangeMutationVariables>;
export const RemovePositionDocument = gql`
    mutation removePosition($_id: String!) {
  removePosition(_id: $_id)
}
    `;
export type RemovePositionMutationFn = Apollo.MutationFunction<RemovePositionMutation, RemovePositionMutationVariables>;
export type RemovePositionMutationResult = Apollo.MutationResult<RemovePositionMutation>;
export type RemovePositionMutationOptions = Apollo.BaseMutationOptions<RemovePositionMutation, RemovePositionMutationVariables>;
export const SyncPositionsDocument = gql`
    mutation syncPositions($_id: String!) {
  syncPositions(_id: $_id) {
    _id
  }
}
    `;
export type SyncPositionsMutationFn = Apollo.MutationFunction<SyncPositionsMutation, SyncPositionsMutationVariables>;
export type SyncPositionsMutationResult = Apollo.MutationResult<SyncPositionsMutation>;
export type SyncPositionsMutationOptions = Apollo.BaseMutationOptions<SyncPositionsMutation, SyncPositionsMutationVariables>;