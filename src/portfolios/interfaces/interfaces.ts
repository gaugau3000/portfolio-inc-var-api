export type direction = 'long' | 'short';

export interface position extends positionOpportunity {
  uuid: string;
}

export interface positionOpportunity {
  pair: string;
  dollarAmount: number;
  direction: direction;
  dataSource: dataSource;
}

export type positions = Array<position>;

export type timeframe =
  | '1m'
  | '5m'
  | '15m'
  | '30m'
  | '1h'
  | '2h'
  | '4h'
  | '8h'
  | '12h'
  | '1d'
  | '2d'
  | '1w'
  | '1m';

export interface addPositionResponse {
  status: 'accepted' | 'rejected';
  uuid?: string;
}

export type dataSource = 'binance_future';
