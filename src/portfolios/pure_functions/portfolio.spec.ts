import {
  isAcceptedOpportunity,
  isBelowMaxOpenTradeSameSymbolSameDirection,
} from './portfolio';

import {
  positionOpportunity,
  portfolioState,
  opportunityInfo,
  portfolioConstraints,
  SupportedExchanges,
} from '../interfaces/interfaces';

jest.mock('../pure_functions/candles', () => {
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

describe('Given 1 have 1 long BTC position open in portfolio when i try to add new btc long and i have max 1 open trade per direction allowed', () => {
  it('isBelowMaxOpenTradeSameSymbolSameDirection should be false ', async () => {
    expect(
      isBelowMaxOpenTradeSameSymbolSameDirection(
        'BTC/USDT',
        'long',
        [
          {
            pair: 'BTC/USDT',
            dollarAmount: 0,
            direction: 'long',
            id: 1,
            dataSource: SupportedExchanges.BinanceFutures,
          },
        ],
        1,
      ),
    ).toBeFalsy();
  });
});

describe('Given i try to add new btc long and i have max 1 open trade per direction allowed and not position open', () => {
  it('isBelowMaxOpenTradeSameSymbolSameDirection should be true ', async () => {
    expect(
      isBelowMaxOpenTradeSameSymbolSameDirection('BTC/USDT', 'long', [], 1),
    ).toBeTruthy();
  });
});

describe('Given i have a portfolio with max var allowed is 200  with 1 max open trade per direction per pair and current var is 0', () => {
  it('when i ask if there is an opportunity adding a long BTC/USDT of 100 dollar var, the opportunity should be accepted', async () => {
    const positionOpportunity: positionOpportunity = {
      pair: 'BTC/USDT',
      dollarAmount: 0,
      direction: 'long',
      dataSource: SupportedExchanges.BinanceFutures,
    };

    const opportunityInfo: opportunityInfo = {
      opportunity: {
        positionOpportunity: positionOpportunity,
        proposedVar: 100,
      },
    };

    const portfolioState: portfolioState = {
      id: 1,
      positions: [],
      valueAtRisk: 0,
    };

    const portfolioConstraints: portfolioConstraints = {
      maxVarInDollar: 200,
      maxOpenTradeSameSymbolSameDirection: 1,
    };

    expect(
      await isAcceptedOpportunity(
        opportunityInfo,
        portfolioState,
        portfolioConstraints,
      ),
    ).toBe(true);
  });
});

describe('Given i have a portfolio with max var allowed is 200  with 1 max open trade per direction per pair and current var 100', () => {
  it('when i ask if there is an opportunity adding a long ETH/USDT of 110 dollar of var, the opportunity should be rejected', async () => {
    const positionOpportunity: positionOpportunity = {
      pair: 'ETH/USDT',
      dollarAmount: 0,
      direction: 'long',
      dataSource: SupportedExchanges.BinanceFutures,
    };

    const opportunityInfo: opportunityInfo = {
      opportunity: {
        positionOpportunity: positionOpportunity,
        proposedVar: 100 + 110,
      },
    };

    const portfolioState: portfolioState = {
      id: 1,
      positions: [],
      valueAtRisk: 100,
    };

    const portfolioConstraints: portfolioConstraints = {
      maxVarInDollar: 200,
      maxOpenTradeSameSymbolSameDirection: 1,
    };

    expect(
      await isAcceptedOpportunity(
        opportunityInfo,
        portfolioState,
        portfolioConstraints,
      ),
    ).toBe(false);
  });
});

describe('Given i have a portfolio with max var allowed is 200  with 1 max open trade per direction per pair and current var 250', () => {
  it('when i ask if there is an opportunity adding a long ETH/USDT of decrease var of 30 dollar , the opportunity should be accepted', async () => {
    const positionOpportunity: positionOpportunity = {
      pair: 'ETH/USDT',
      dollarAmount: 0,
      direction: 'long',
      dataSource: SupportedExchanges.BinanceFutures,
    };

    const opportunityInfo: opportunityInfo = {
      opportunity: {
        positionOpportunity: positionOpportunity,
        proposedVar: 250 - 30,
      },
    };

    const portfolioState: portfolioState = {
      id: 1,
      positions: [],
      valueAtRisk: 250,
    };

    const portfolioConstraints: portfolioConstraints = {
      maxVarInDollar: 200,
      maxOpenTradeSameSymbolSameDirection: 1,
    };

    expect(
      await isAcceptedOpportunity(
        opportunityInfo,
        portfolioState,
        portfolioConstraints,
      ),
    ).toBe(true);
  });
});
