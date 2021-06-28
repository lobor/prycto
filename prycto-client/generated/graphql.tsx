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
  checkHeader: Scalars['Boolean'];
  hasInit1: Scalars['Boolean'];
  positions: Array<Position>;
  getMarkets: Scalars['JSON'];
};


export type QueryExchangeByIdArgs = {
  _id: Scalars['String'];
};

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

export type PositionsQueryVariables = Exact<{ [key: string]: never; }>;


export type PositionsQuery = (
  { __typename?: 'Query' }
  & { positions: Array<(
    { __typename?: 'Position' }
    & Pick<Position, '_id' | 'pair' | 'exchangeId' | 'available' | 'locked' | 'investment' | 'objectif'>
  )> }
);


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