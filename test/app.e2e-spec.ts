import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { CreatePortfolioDto } from 'src/portfolios/dto/create-portfolio.dto';
import { AddPortfolioPositionDto } from 'src/portfolios/dto/add-portfolio-position.dto';

jest.mock('../src/portfolios/pure_functions/candles', () => {
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

describe('Portfolio Controller (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  describe('/portfolios (POST)', () => {
    let portfolioUuid = '';
    let positionUUid = '';

    it('/portfolios (POST)', () => {
      const createPortfolioDto: CreatePortfolioDto = {
        maxVarInDollar: 100,
        maxOpenTradeSameSymbolSameDirection: 1,
        nbComputePeriods: 20,
        zscore: 1.65,
        timeframe: '1m',
      };
      return request(app.getHttpServer())
        .post('/portfolios')
        .send({ createPortfolioDto })
        .expect((res) => {
          portfolioUuid = res.body.uuid;
        })
        .expect(201);
    });

    it('/portfolios/id/position (POST)', () => {
      const addPortfolioPosition: AddPortfolioPositionDto = {
        pair: 'BTC/USDT',
        dollarAmount: 100,
        direction: 'long',
        dataSource: 'binance_future',
      };

      return request(app.getHttpServer())
        .post(`/portfolios/${portfolioUuid}/positions`)
        .send({ addPortfolioPosition })
        .expect((res) => {
          positionUUid = res.body.uuid;
        })
        .expect(201);
    });

    it('/portfolios/:portfolioId/position/:positionId (Delete)', () => {
      return request(app.getHttpServer())
        .delete(`/portfolios/${portfolioUuid}/positions/${positionUUid}`)
        .expect(200);
    });
  });
});
