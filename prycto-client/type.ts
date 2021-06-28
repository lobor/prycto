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
  objectif?: number;
  _id: string;
}

export interface EditPositionParams {
  exchangeId?: string;
  positionId: string;
  objectif: number;
}

export interface PnlParams {
  symbol?: string;
  exchangeId: string;
}

export type RemovePositionParams = string;
