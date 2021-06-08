export interface GetAllPairsResponse {
  symbol: string;
  exchange: string;
  exchangeId: string;
}

export interface AddPositionParams {
  exchangeId: string;
  symbol: string;
}

export interface GetPositionResponse {
  available: number;
  exchange: string;
  exchangeId: string;
  investment: number;
  locked: number;
  pair: string;
  _id: string;
}

export interface EditPositionParams {
  exchangeId: string;
  available: number;
  locked: number;
  positionId: string
}

export type RemovePositionParams = string;
