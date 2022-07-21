// eslint-disable-next-line prettier/prettier
// eslint-disable-next-line @typescript-eslint/no-var-requires
const ccxt = require('ccxt');

import { dataSource } from '../interfaces/interfaces';
import { AppConfig } from '../models/app-config';

export async function getAssetLastCloses(
  pair: string,
  nbComputePeriods: number,
  timeframe: string,
  dataSource: dataSource,
) {
  const ccxtExtra = {
    enableRateLimit: false,
    urls: {
      api: {
        ...(AppConfig.get('ccxtExtraConfig.binanceFutureUrlOverwrite') && {
          fapiPublic: AppConfig.get(
            'ccxtExtraConfig.binanceFutureUrlOverwrite',
          ),
        }),
      },
    },
  };

  const binanceFuture = new ccxt.binance({
    ...ccxtExtra,
    options: {
      defaultType: 'future',
    },
  });
  let ohlc;
  if (dataSource === 'binance_futures')
    ohlc = await binanceFuture.fetchOHLCV(pair, timeframe);
  else throw new Error(`${dataSource} is not implemented has data source`);

  ohlc = ohlc.map((candle) => candle[4]).slice(-nbComputePeriods - 1);
  ohlc.pop();

  return ohlc;
}
