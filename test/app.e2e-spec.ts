import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { CreatePortfolioDto } from '../src/portfolios/dto/create-portfolio.dto';
import { AddPortfolioPositionDto } from '../src/portfolios/dto/add-portfolio-position.dto';
import { UpdatePortfolioDto } from '../src/portfolios/dto/update-portfolio.dto';
import { PrismaService } from '../src/prisma.service';

// jest.mock('../src/portfolios/pure_functions/candles', () => {
//   return {
//     getAssetLastCloses: jest
//       .fn()
//       .mockResolvedValueOnce([
//         29482.5, 29313.5, 29065, 29091.4, 28827.2, 28930.1, 28812.6, 29335.4,
//         29600, 29517.8, 29325.8, 29366.7, 29690, 30223.3, 30079.8, 29949.7,
//         29925.8, 29841.1, 29715.9, 29607.5,
//       ])
//       .mockResolvedValueOnce([
//         2028, 2012.91, 1984.35, 1984.14, 1961.98, 1972.51, 1962.65, 2007.42,
//         2016.85, 2013, 1995.17, 1997.68, 2027, 2055.19, 2055, 2051.99, 2039.48,
//         2031.72, 2013.15, 2014.16,
//       ])
//       .mockResolvedValueOnce([
//         29482.5, 29313.5, 29065, 29091.4, 28827.2, 28930.1, 28812.6, 29335.4,
//         29600, 29517.8, 29325.8, 29366.7, 29690, 30223.3, 30079.8, 29949.7,
//         29925.8, 29841.1, 29715.9, 29607.5,
//       ])
//       .mockResolvedValueOnce([
//         2028, 2012.91, 1984.35, 1984.14, 1961.98, 1972.51, 1962.65, 2007.42,
//         2016.85, 2013, 1995.17, 1997.68, 2027, 2055.19, 2055, 2051.99, 2039.48,
//         2031.72, 2013.15, 2014.16,
//       ]),
//   };
// });

jest.setTimeout(20000);

let app: INestApplication;
let prisma: PrismaService;
async function initApp() {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  app = moduleFixture.createNestApplication();
  app.useGlobalPipes(new ValidationPipe({ enableDebugMessages: true }));
  await app.init();
  prisma = app.get<PrismaService>(PrismaService);
  await prisma.position.deleteMany({});
  await prisma.portfolio.deleteMany({});
}

describe('Portfolio Create a portfolio -> create allowed position -> delete position ', () => {
  beforeEach(async () => {
    await initApp();
  });

  const createPortfolioDto: CreatePortfolioDto = {
    params: {
      nbComputePeriods: 20,
      zscore: 1.65,
      timeframe: '1m',
      nameId: 'crypto_15m',
    },
    constraints: {
      maxVarInDollar: 100,
      maxOpenTradeSameSymbolSameDirection: 1,
    },
  };

  const addAcceptedPortfolioPosition: AddPortfolioPositionDto = {
    pair: 'BTC/USDT',
    dollarAmount: 100,
    direction: 'long',
    dataSource: 'binance_futures',
  };

  describe('When I create a portfolio with max var of 100, max open trade of 1 on 1 min tf then', () => {
    it('should return a 201 code (accepted)', () => {
      return request(app.getHttpServer())
        .post('/portfolios')
        .send(createPortfolioDto)
        .expect(201);
    });
  });

  describe('When I create a portfolio with max var of 100, max open trade of 1 on 1 min tf and add an allowed position then', () => {
    it('should return a 201 (accepted) code', async () => {
      let portfolioId = 0;

      await request(app.getHttpServer())
        .post('/portfolios')
        .send(createPortfolioDto)
        .expect((res) => {
          portfolioId = res.body.id;
        });

      return request(app.getHttpServer())
        .post(`/portfolios/${portfolioId}/positions`)
        .send(addAcceptedPortfolioPosition)
        .expect(201);
    });
  });

  describe('When I create a portfolio with max var of 100, max open trade of 1 on 1 min tf and I add an allowed position when i delete this position then', () => {
    it('should return a 200 (ok) code', async () => {
      let portfolioId = 0;
      let positionId = 0;

      await request(app.getHttpServer())
        .post('/portfolios')
        .send(createPortfolioDto)
        .expect((res) => {
          portfolioId = res.body.id;
        });

      await request(app.getHttpServer())
        .post(`/portfolios/${portfolioId}/positions`)
        .send(addAcceptedPortfolioPosition)
        .expect((res) => {
          positionId = res.body.id;
        });

      return request(app.getHttpServer())
        .delete(`/portfolios/${portfolioId}/positions/${positionId}`)
        .expect(200);
    });
  });
});

describe('Portfolio Create a portfolio -> add allowed position -> add rejected position  ', () => {
  beforeAll(async () => {
    await initApp();
  });

  const createPortfolioDto: CreatePortfolioDto = {
    params: {
      nbComputePeriods: 20,
      zscore: 1.65,
      timeframe: '1m',
      nameId: 'crypto_15m',
    },
    constraints: {
      maxVarInDollar: 100,
      maxOpenTradeSameSymbolSameDirection: 1,
    },
  };

  const addPortfolioPositionAccepted: AddPortfolioPositionDto = {
    pair: 'BTC/USDT',
    dollarAmount: 100,
    direction: 'short',
    dataSource: 'binance_futures',
  };

  const addPortfolioPositionRejected: AddPortfolioPositionDto = {
    pair: 'ETH/USDT',
    dollarAmount: 1000000,
    direction: 'short',
    dataSource: 'binance_futures',
  };

  describe('Create a portfolio with max var of 100, max open trade of 1 on 1 min tf and add an accepted position when I add a rejected position ', () => {
    let portfolioId = '';

    it('should give status forbidden (403)', async () => {
      await request(app.getHttpServer())
        .post('/portfolios')
        .send(createPortfolioDto)
        .expect((res) => {
          portfolioId = res.body.id;
        });

      await request(app.getHttpServer())
        .post(`/portfolios/${portfolioId}/positions`)
        .send(addPortfolioPositionAccepted);

      return request(app.getHttpServer())
        .post(`/portfolios/${portfolioId}/positions`)
        .send(addPortfolioPositionRejected)
        .expect(403);
    });
  });
});

describe('Portfolio Create a portfolio -> add allowed position -> change allowed var -> add rejected position ', () => {
  beforeEach(async () => {
    await initApp();
  });

  describe('Create a portfolio with max var of 100000, max open trade of 1 on 1 min tf and add an accepted position when i had position upper var allowed then', () => {
    let portfolioId = '';

    const createPortfolioDto: CreatePortfolioDto = {
      params: {
        nbComputePeriods: 20,
        zscore: 1.65,
        timeframe: '1m',
        nameId: 'crypto_15m',
      },
      constraints: {
        maxVarInDollar: 100000,
        maxOpenTradeSameSymbolSameDirection: 1,
      },
    };

    const addPortfolioPositionAccepted: AddPortfolioPositionDto = {
      pair: 'BTC/USDT',
      dollarAmount: 1000000,
      direction: 'long',
      dataSource: 'binance_futures',
    };

    const updatePortfolioDto: UpdatePortfolioDto = {
      maxVarInDollar: 1,
    };

    const addPortfolioPositionRejected: AddPortfolioPositionDto = {
      pair: 'ETH/USDT',
      dollarAmount: 1,
      direction: 'long',
      dataSource: 'binance_futures',
    };

    it('should give status code 403 (forbidden) with message error "you cannot add this position because you will exceed max allowed var" ', async () => {
      let error = '';
      await request(app.getHttpServer())
        .post('/portfolios')
        .send(createPortfolioDto)
        .expect((res) => {
          portfolioId = res.body.id;
        });

      await request(app.getHttpServer())
        .post(`/portfolios/${portfolioId}/positions`)
        .send(addPortfolioPositionAccepted);

      await request(app.getHttpServer())
        .patch(`/portfolios/${portfolioId}`)
        .send(updatePortfolioDto)
        .expect(200);

      await request(app.getHttpServer())
        .post(`/portfolios/${portfolioId}/positions`)
        .send(addPortfolioPositionRejected)
        .expect((res) => {
          error = res.body.error;
        })
        .expect(403);

      expect(error).toBe(
        'you cannot add this position because you will exceed max allowed var',
      );
    });
  });
});
