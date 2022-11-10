// eslint-disable-next-line prettier/prettier
// eslint-disable-next-line @typescript-eslint/no-var-requires
const ccxt = require('ccxt');

import { AppConfig } from '../models/app-config';
import { SupportedExchanges } from '../interfaces/interfaces';

let binanceFutures;
let binanceSpot;

export async function getMarket(exchangeDataSource: SupportedExchanges) {
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

  if (exchangeDataSource === SupportedExchanges.BinanceFutures) {
    if (binanceFutures !== null && binanceFutures !== undefined)
      return binanceFutures;
    binanceFutures = new ccxt.binance({
      ...ccxtBinanceExtra,
      options: {
        defaultType: 'future',
      },
    });
    return binanceFutures;
  } else if (exchangeDataSource === SupportedExchanges.BinanceSpot) {
    if (binanceSpot !== null && binanceSpot !== undefined) return binanceSpot;
    binanceSpot = new ccxt.binance({
      ...ccxtBinanceExtra,
    });
    return binanceSpot;
  } else
    throw new Error(`${exchangeDataSource} is not implemented has data source`);
}

export async function getAssetLastCloses(
  pair: string,
  nbComputePeriods: number,
  timeframe: string,
  exchangeDataSource: SupportedExchanges,
) {
  const market = await getMarket(exchangeDataSource);
  let ohlc = await market.fetchOHLCV(pair, timeframe);

  ohlc = ohlc.map((candle) => candle[4]).slice(-nbComputePeriods);

  return ohlc;
}
