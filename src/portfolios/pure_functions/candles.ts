// eslint-disable-next-line prettier/prettier
// eslint-disable-next-line @typescript-eslint/no-var-requires
const ccxt = require('ccxt');

import { dataSource } from '../interfaces/interfaces';
import config from '../../config/configuration';
const binanceFuture = new ccxt.binance({
  ...config().ccxt_extra,
  options: {
    defaultType: 'future',
  },
});
export async function getAssetLastCloses(
  pair: string,
  nbComputePeriods: number,
  timeframe: string,
  dataSource: dataSource,
) {
  let ohlc;
  if (dataSource === 'binance_future')
    ohlc = await binanceFuture.fetchOHLCV(pair, timeframe);
  else throw new Error(`${dataSource} is not implemented has data source`);

  ohlc = ohlc.map((candle) => candle[4]).slice(-nbComputePeriods - 1);
  ohlc.pop();

  return ohlc;
}
