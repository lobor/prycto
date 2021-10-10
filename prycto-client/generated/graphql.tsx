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
  address: Scalars['String'];
  balance?: Maybe<Scalars['JSON']>;
};

export type History = {
  __typename?: 'History';
  symbol: Scalars['String'];
  exchangeId: Scalars['String'];
  timestamp: Scalars['Float'];
  type: Scalars['String'];
  side: Scalars['String'];
  price: Scalars['Float'];
  amount: Scalars['Float'];
  cost: Scalars['Float'];
  average: Scalars['Float'];
  filled: Scalars['Float'];
  remaining: Scalars['Float'];
  status: Scalars['String'];
};


export type Mutation = {
  __typename?: 'Mutation';
  addExchange: Exchange;
  removeExchange: Scalars['Boolean'];
  updateExchange: Exchange;
  login: Scalars['String'];
  register: Scalars['Boolean'];
  updateUser: User;
  updatePassword: User;
  logout: Scalars['Boolean'];
  updateLang: User;
  removePosition: Scalars['Boolean'];
  editPosition: Position;
  syncPositions: Position;
  addPosition: Position;
};


export type MutationAddExchangeArgs = {
  name: Scalars['String'];
  address: Scalars['String'];
  exchange: Scalars['String'];
  publicKey: Scalars['String'];
  secretKey: Scalars['String'];
};


export type MutationRemoveExchangeArgs = {
  _id: Scalars['String'];
};


export type MutationUpdateExchangeArgs = {
  balance: Scalars['JSON'];
  _id: Scalars['ID'];
};


export type MutationLoginArgs = {
  password: Scalars['String'];
  email: Scalars['String'];
};


export type MutationRegisterArgs = {
  confirmPassword: Scalars['String'];
  password: Scalars['String'];
  email: Scalars['String'];
};


export type MutationUpdateUserArgs = {
  email: Scalars['String'];
  _id: Scalars['ID'];
};


export type MutationUpdatePasswordArgs = {
  confirmPassword: Scalars['String'];
  password: Scalars['String'];
  oldPassword: Scalars['String'];
};


export type MutationLogoutArgs = {
  confirmPassword: Scalars['String'];
  password: Scalars['String'];
  email: Scalars['String'];
};


export type MutationUpdateLangArgs = {
  lang: Scalars['String'];
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
  predict: Predict;
};

export type Predict = {
  __typename?: 'Predict';
  _id: Scalars['ID'];
  up: Scalars['Float'];
  pair: Scalars['String'];
  down: Scalars['Float'];
  predictDate: Scalars['Float'];
  verified: Scalars['Boolean'];
};

export type Query = {
  __typename?: 'Query';
  exchangeById: Exchange;
  exchanges: Array<Exchange>;
  user: User;
  positions: Array<Position>;
  position: Position;
  getHistoryBySymbol: Array<Cours>;
  getMarkets: Scalars['JSON'];
  getPairs: Array<Pair>;
  getHistoryOrderBySymbol: Array<History>;
};


export type QueryExchangeByIdArgs = {
  _id: Scalars['String'];
};


export type QueryPositionsArgs = {
  exchangeId: Scalars['ID'];
};


export type QueryPositionArgs = {
  _id: Scalars['String'];
};


export type QueryGetHistoryBySymbolArgs = {
  limit?: Maybe<Scalars['Int']>;
  symbol: Scalars['String'];
};


export type QueryGetMarketsArgs = {
  exchangeId: Scalars['String'];
};


export type QueryGetHistoryOrderBySymbolArgs = {
  positionId: Scalars['String'];
  symbol: Scalars['String'];
};

export type Subscription = {
  __typename?: 'Subscription';
  marketHit: Scalars['JSON'];
};


export type SubscriptionMarketHitArgs = {
  exchangeId: Scalars['String'];
};

export type User = {
  __typename?: 'User';
  _id: Scalars['ID'];
  email: Scalars['String'];
  tokens: Array<Scalars['String']>;
  password: Scalars['String'];
  createdAt: Scalars['Float'];
  lang: Scalars['String'];
};

export type AddExchangeMutationVariables = Exact<{
  name: Scalars['String'];
  exchange: Scalars['String'];
  publicKey: Scalars['String'];
  secretKey: Scalars['String'];
  address: Scalars['String'];
}>;


export type AddExchangeMutation = (
  { __typename?: 'Mutation' }
  & { addExchange: (
    { __typename?: 'Exchange' }
    & Pick<Exchange, 'name' | 'exchange' | 'publicKey' | 'address' | 'secretKey' | '_id'>
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

export type BalancesByExchangeIdQueryVariables = Exact<{
  _id: Scalars['String'];
}>;


export type BalancesByExchangeIdQuery = (
  { __typename?: 'Query' }
  & { exchangeById: (
    { __typename?: 'Exchange' }
    & Pick<Exchange, '_id' | 'balance'>
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
    & Pick<Exchange, 'name' | '_id' | 'exchange'>
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

export type GetHistoryOrderBySymbolQueryVariables = Exact<{
  symbol: Scalars['String'];
  positionId: Scalars['String'];
}>;


export type GetHistoryOrderBySymbolQuery = (
  { __typename?: 'Query' }
  & { getHistoryOrderBySymbol: Array<(
    { __typename?: 'History' }
    & Pick<History, 'amount' | 'side' | 'status' | 'symbol' | 'type' | 'timestamp' | 'cost' | 'price'>
  )> }
);

export type GetMarketsQueryVariables = Exact<{
  exchangeId: Scalars['String'];
}>;


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

export type LoginMutationVariables = Exact<{
  email: Scalars['String'];
  password: Scalars['String'];
}>;


export type LoginMutation = (
  { __typename?: 'Mutation' }
  & Pick<Mutation, 'login'>
);

export type MarketHitSubscriptionVariables = Exact<{
  exchangeId: Scalars['String'];
}>;


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

export type PositionsQueryVariables = Exact<{
  exchangeId: Scalars['ID'];
}>;


export type PositionsQuery = (
  { __typename?: 'Query' }
  & { positions: Array<(
    { __typename?: 'Position' }
    & Pick<Position, '_id' | 'pair' | 'exchangeId' | 'available' | 'locked' | 'investment' | 'objectif'>
    & { predict: (
      { __typename?: 'Predict' }
      & Pick<Predict, 'up' | 'down' | 'predictDate'>
    ) }
  )> }
);

export type PredictQueryVariables = Exact<{
  exchangeId: Scalars['ID'];
}>;


export type PredictQuery = (
  { __typename?: 'Query' }
  & { positions: Array<(
    { __typename?: 'Position' }
    & Pick<Position, '_id' | 'pair'>
    & { predict: (
      { __typename?: 'Predict' }
      & Pick<Predict, 'up' | 'down' | 'predictDate'>
    ) }
  )> }
);

export type RegisterMutationVariables = Exact<{
  email: Scalars['String'];
  password: Scalars['String'];
  confirmPassword: Scalars['String'];
}>;


export type RegisterMutation = (
  { __typename?: 'Mutation' }
  & Pick<Mutation, 'register'>
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

export type UpdateExchangeMutationVariables = Exact<{
  _id: Scalars['ID'];
  balance: Scalars['JSON'];
}>;


export type UpdateExchangeMutation = (
  { __typename?: 'Mutation' }
  & { updateExchange: (
    { __typename?: 'Exchange' }
    & Pick<Exchange, 'balance' | '_id'>
  ) }
);

export type UpdateLangMutationVariables = Exact<{
  lang: Scalars['String'];
}>;


export type UpdateLangMutation = (
  { __typename?: 'Mutation' }
  & { updateLang: (
    { __typename?: 'User' }
    & Pick<User, '_id' | 'lang'>
  ) }
);

export type UpdatePasswordMutationVariables = Exact<{
  oldPassword: Scalars['String'];
  password: Scalars['String'];
  confirmPassword: Scalars['String'];
}>;


export type UpdatePasswordMutation = (
  { __typename?: 'Mutation' }
  & { updatePassword: (
    { __typename?: 'User' }
    & Pick<User, '_id'>
  ) }
);

export type UpdateUserMutationVariables = Exact<{
  _id: Scalars['ID'];
  email: Scalars['String'];
}>;


export type UpdateUserMutation = (
  { __typename?: 'Mutation' }
  & { updateUser: (
    { __typename?: 'User' }
    & Pick<User, '_id' | 'email'>
  ) }
);

export type UserQueryVariables = Exact<{ [key: string]: never; }>;


export type UserQuery = (
  { __typename?: 'Query' }
  & { user: (
    { __typename?: 'User' }
    & Pick<User, '_id' | 'email' | 'lang'>
  ) }
);


export const AddExchangeDocument = gql`
    mutation addExchange($name: String!, $exchange: String!, $publicKey: String!, $secretKey: String!, $address: String!) {
  addExchange(
    name: $name
    exchange: $exchange
    publicKey: $publicKey
    secretKey: $secretKey
    address: $address
  ) {
    name
    exchange
    publicKey
    address
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
export const BalancesByExchangeIdDocument = gql`
    query balancesByExchangeId($_id: String!) {
  exchangeById(_id: $_id) {
    _id
    balance
  }
}
    `;
export type BalancesByExchangeIdQueryResult = Apollo.QueryResult<BalancesByExchangeIdQuery, BalancesByExchangeIdQueryVariables>;
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
    exchange
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
export const GetHistoryOrderBySymbolDocument = gql`
    query getHistoryOrderBySymbol($symbol: String!, $positionId: String!) {
  getHistoryOrderBySymbol(symbol: $symbol, positionId: $positionId) {
    amount
    side
    status
    symbol
    type
    timestamp
    cost
    price
  }
}
    `;
export type GetHistoryOrderBySymbolQueryResult = Apollo.QueryResult<GetHistoryOrderBySymbolQuery, GetHistoryOrderBySymbolQueryVariables>;
export const GetMarketsDocument = gql`
    query getMarkets($exchangeId: String!) {
  getMarkets(exchangeId: $exchangeId)
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
export const LoginDocument = gql`
    mutation login($email: String!, $password: String!) {
  login(email: $email, password: $password)
}
    `;
export type LoginMutationFn = Apollo.MutationFunction<LoginMutation, LoginMutationVariables>;
export type LoginMutationResult = Apollo.MutationResult<LoginMutation>;
export type LoginMutationOptions = Apollo.BaseMutationOptions<LoginMutation, LoginMutationVariables>;
export const MarketHitDocument = gql`
    subscription marketHit($exchangeId: String!) {
  marketHit(exchangeId: $exchangeId)
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
    query positions($exchangeId: ID!) {
  positions(exchangeId: $exchangeId) {
    _id
    pair
    exchangeId
    available
    locked
    investment
    objectif
    predict {
      up
      down
      predictDate
    }
  }
}
    `;
export type PositionsQueryResult = Apollo.QueryResult<PositionsQuery, PositionsQueryVariables>;
export const PredictDocument = gql`
    query predict($exchangeId: ID!) {
  positions(exchangeId: $exchangeId) {
    _id
    pair
    predict {
      up
      down
      predictDate
    }
  }
}
    `;
export type PredictQueryResult = Apollo.QueryResult<PredictQuery, PredictQueryVariables>;
export const RegisterDocument = gql`
    mutation register($email: String!, $password: String!, $confirmPassword: String!) {
  register(email: $email, password: $password, confirmPassword: $confirmPassword)
}
    `;
export type RegisterMutationFn = Apollo.MutationFunction<RegisterMutation, RegisterMutationVariables>;
export type RegisterMutationResult = Apollo.MutationResult<RegisterMutation>;
export type RegisterMutationOptions = Apollo.BaseMutationOptions<RegisterMutation, RegisterMutationVariables>;
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
export const UpdateExchangeDocument = gql`
    mutation updateExchange($_id: ID!, $balance: JSON!) {
  updateExchange(_id: $_id, balance: $balance) {
    balance
    _id
  }
}
    `;
export type UpdateExchangeMutationFn = Apollo.MutationFunction<UpdateExchangeMutation, UpdateExchangeMutationVariables>;
export type UpdateExchangeMutationResult = Apollo.MutationResult<UpdateExchangeMutation>;
export type UpdateExchangeMutationOptions = Apollo.BaseMutationOptions<UpdateExchangeMutation, UpdateExchangeMutationVariables>;
export const UpdateLangDocument = gql`
    mutation updateLang($lang: String!) {
  updateLang(lang: $lang) {
    _id
    lang
  }
}
    `;
export type UpdateLangMutationFn = Apollo.MutationFunction<UpdateLangMutation, UpdateLangMutationVariables>;
export type UpdateLangMutationResult = Apollo.MutationResult<UpdateLangMutation>;
export type UpdateLangMutationOptions = Apollo.BaseMutationOptions<UpdateLangMutation, UpdateLangMutationVariables>;
export const UpdatePasswordDocument = gql`
    mutation updatePassword($oldPassword: String!, $password: String!, $confirmPassword: String!) {
  updatePassword(
    oldPassword: $oldPassword
    password: $password
    confirmPassword: $confirmPassword
  ) {
    _id
  }
}
    `;
export type UpdatePasswordMutationFn = Apollo.MutationFunction<UpdatePasswordMutation, UpdatePasswordMutationVariables>;
export type UpdatePasswordMutationResult = Apollo.MutationResult<UpdatePasswordMutation>;
export type UpdatePasswordMutationOptions = Apollo.BaseMutationOptions<UpdatePasswordMutation, UpdatePasswordMutationVariables>;
export const UpdateUserDocument = gql`
    mutation updateUser($_id: ID!, $email: String!) {
  updateUser(_id: $_id, email: $email) {
    _id
    email
  }
}
    `;
export type UpdateUserMutationFn = Apollo.MutationFunction<UpdateUserMutation, UpdateUserMutationVariables>;
export type UpdateUserMutationResult = Apollo.MutationResult<UpdateUserMutation>;
export type UpdateUserMutationOptions = Apollo.BaseMutationOptions<UpdateUserMutation, UpdateUserMutationVariables>;
export const UserDocument = gql`
    query user {
  user {
    _id
    email
    lang
  }
}
    `;
export type UserQueryResult = Apollo.QueryResult<UserQuery, UserQueryVariables>;