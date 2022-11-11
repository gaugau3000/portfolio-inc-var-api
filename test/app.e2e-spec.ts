import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { CreatePortfolioDto } from '../src/portfolios/dto/create-portfolio.dto';
import { AddPortfolioPositionDto } from '../src/portfolios/dto/add-portfolio-position.dto';
import { UpdatePortfolioDto } from '../src/portfolios/dto/update-portfolio.dto';
import { PrismaService } from '../src/prisma.service';
import { SupportedExchanges } from '../src/portfolios/interfaces/interfaces';

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

describe('Test e2e portfolio', () => {
  afterAll(async () => {
    await prisma.position.deleteMany({});
    await prisma.portfolio.deleteMany({});
  });

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
      dataSource: SupportedExchanges.BinanceFutures,
      strategy: 'MaCrossOver',
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
          .delete(`/portfolios/positions/${positionId}`)
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
      dataSource: SupportedExchanges.BinanceFutures,
      strategy: 'MaCrossOver',
    };

    const addPortfolioPositionRejected: AddPortfolioPositionDto = {
      pair: 'ETH/USDT',
      dollarAmount: 1000000,
      direction: 'short',
      dataSource: SupportedExchanges.BinanceFutures,
      strategy: 'MaCrossOver',
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

    describe('Create a portfolio with max var of 100000, max open trade of 1 on 1 min tf and add an accepted position \
              when i had position upper var allowed then', () => {
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
        dataSource: SupportedExchanges.BinanceFutures,
        strategy: 'MaCrossOver',
      };

      const updatePortfolioDto: UpdatePortfolioDto = {
        maxVarInDollar: 1,
      };

      const addPortfolioPositionRejected: AddPortfolioPositionDto = {
        pair: 'ETH/USDT',
        dollarAmount: 1,
        direction: 'long',
        dataSource: SupportedExchanges.BinanceFutures,
        strategy: 'MaCrossOver',
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

  describe('Portfolio Create a portfolio -> add allowed position -> get positions using portfolio name ', () => {
    beforeEach(async () => {
      await initApp();
    });

    describe('Create a valid portfolio, add a valid position and get positions using portfolio name', () => {
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
        dataSource: SupportedExchanges.BinanceFutures,
        strategy: 'MaCrossOver',
      };

      it('should return 200 status code and first element of array for property should be MaCrossOver', async () => {
        await request(app.getHttpServer())
          .post('/portfolios')
          .send(createPortfolioDto)
          .expect((res) => {
            portfolioId = res.body.id;
          });

        await request(app.getHttpServer())
          .post(`/portfolios/${portfolioId}/positions`)
          .send(addPortfolioPositionAccepted);

        const portfolioPositions = await request(app.getHttpServer())
          .get(`/portfolios/${portfolioId}/positions/findByStrategy`)
          .query({ strategy: 'MaCrossOver' })
          .expect(200);
        expect(portfolioPositions.body[0].strategy).toBe('MaCrossOver');
      });
    });
  });
});
