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
};

export type Query = {
  __typename?: 'Query';
  exchangeById: Exchange;
  exchanges: Array<Exchange>;
  hasInit1: Scalars['Boolean'];
  positions: Array<Position>;
  getMarkets: Scalars['JSON'];
  getPairs: Array<Pair>;
};


export type QueryExchangeByIdArgs = {
  _id: Scalars['String'];
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