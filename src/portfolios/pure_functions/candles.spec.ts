import { getAssetLastCloses } from './candles';
import * as testData from './test.data.json';
import { AppConfig } from '../models/app-config';
import { SupportedExchanges } from '../interfaces/interfaces';
jest.mock('ccxt', () => {
  return {
    binance: jest.fn().mockImplementation(() => {
      return {
        fetchOHLCV: () => {
          return testData.candles_btc_1h;
        },
      };
    }),
  };
});

jest.mock('../models/app-config');
describe('Fetch the last n closes candle for binance futures on 1h timeframe for BTC/USDT with nbComputePeriods is 20 on binance future', () => {
  it('should give an array of 20 element and price of last close of 39700  ', async () => {
    jest.spyOn(AppConfig, 'get').mockResolvedValueOnce(undefined);
    const btcCloses = await getAssetLastCloses(
      'BTC/USDT',
      20,
      '1h',
      SupportedExchanges.BinanceFutures,
    );
    expect(btcCloses.length).toBe(20);
    expect(btcCloses[btcCloses.length - 1]).toBe(39700);
  });
});
