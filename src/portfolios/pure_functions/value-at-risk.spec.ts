import {
  getPositionsCorrMatrix,
  getPortfolioStd,
  computeVar,
} from './value-at-risk';
import { position } from '../interfaces/interfaces';

jest.mock('./candles', () => {
  return {
    getAssetLastCloses: jest
      .fn()
      .mockResolvedValueOnce([
        29482.5, 29313.5, 29065, 29091.4, 28827.2, 28930.1, 28812.6, 29335.4,
        29600, 29517.8, 29325.8, 29366.7, 29690, 30223.3, 30079.8, 29949.7,
        29925.8, 29841.1, 29715.9, 29607.5,
      ])
      .mockResolvedValueOnce([
        2028, 2012.91, 1984.35, 1984.14, 1961.98, 1972.51, 1962.65, 2007.42,
        2016.85, 2013, 1995.17, 1997.68, 2027, 2055.19, 2055, 2051.99, 2039.48,
        2031.72, 2013.15, 2014.16,
      ]),
  };
});

describe('three assets with same close price and are lon,long,short ', () => {
  it('should give a Corr Matrix of 1-2->1 1-3->-1 2-3->-1', async () => {
    expect(
      getPositionsCorrMatrix(
        [
          [100, 200, 300, 400],
          [100, 200, 300, 400],
          [100, 200, 300, 400],
        ],
        ['long', 'long', 'short'],
      ),
    ).toStrictEqual([[1, -1], [-1]]);
  });
});

describe('Two positions with weight 0.6 and 0.4 with std returns 0.31% and 0.382% and corelation of 0.3235', () => {
  it('should give a std deviation of all portfolio of 0.27%', async () => {
    expect(getPortfolioStd([0.6, 0.4], [0.0031, 0.00382], [[0.3235]])).toBe(
      0.0027628264078656843,
    );
  });
});

describe('A portfolio with BTC and ETH ', () => {
  it('should give [[1,-1],[-1]]', async () => {
    const btcPosition: position = {
      pair: 'BTC/USDT',
      dollarAmount: 1000,
      direction: 'long',
      id: 1,
      dataSource: 'binance_futures',
    };
    const ethPosition: position = {
      pair: 'ETH/USDT',
      dollarAmount: 1000,
      direction: 'long',
      id: 2,
      dataSource: 'binance_futures',
    };

    expect(await computeVar(1.65, [btcPosition, ethPosition], 20, '1h')).toBe(
      28.843292829950656,
    );
  });
});
