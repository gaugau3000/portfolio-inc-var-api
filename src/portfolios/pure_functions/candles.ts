// eslint-disable-next-line prettier/prettier
// eslint-disable-next-line @typescript-eslint/no-var-requires
const ccxt = require('ccxt');

import { AppConfig } from '../models/app-config';
import { SupportedExchanges } from '../interfaces/interfaces';

export async function getAssetLastCloses(
  pair: string,
  nbComputePeriods: number,
  timeframe: string,
  exchangeDataSource: SupportedExchanges,
) {
  const ccxtBinanceExtra = {
    enableRateLimit: false,
    urls: {
      api: {
        ...(AppConfig.get('ccxtExtraConfig.binanceFutureUrlOverwrite') && {
          fapiPublic: AppConfig.get(
            'ccxtExtraConfig.binanceFutureUrlOverwrite',
          ),
        }),
        ...(AppConfig.get('ccxtExtraConfig.binanceSpotUrlOverwrite') && {
          fapiPublic: AppConfig.get('ccxtExtraConfig.binanceSpotUrlOverwrite'),
        }),
      },
    },
  };

  const binanceFutures = new ccxt.binance({
    ...ccxtBinanceExtra,
    options: {
      defaultType: 'future',
    },
  });

  const binanceSpot = new ccxt.binance({
    ...ccxtBinanceExtra,
  });
  let ohlc;

  if (exchangeDataSource === SupportedExchanges.BinanceFutures)
    ohlc = await binanceFutures.fetchOHLCV(pair, timeframe);
  else if (exchangeDataSource === SupportedExchanges.BinanceSpot)
    ohlc = await binanceSpot.fetchOHLCV(pair, timeframe);
  else
    throw new Error(`${exchangeDataSource} is not implemented has data source`);

  ohlc = ohlc.map((candle) => candle[4]).slice(-nbComputePeriods - 1);
  ohlc.pop();

  return ohlc;
}
