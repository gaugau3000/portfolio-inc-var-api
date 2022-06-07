import { Test, TestingModule } from '@nestjs/testing';
import { CreatePortfolioDto } from './dto/create-portfolio.dto';
import { PortfolioController } from './portfolio.controller';
import { PortfolioService } from './portfolio.service';
import { isUuid } from 'uuidv4';
import { AddPortfolioPositionDto } from './dto/add-portfolio-position.dto';
import { AppConfig } from './models/app-config';
import { ConfigModule } from '@nestjs/config';
import configuration from '../config/configuration';
import { UpdatePortfolioDto } from './dto/update-portfolio.dto';

describe('PortfolioController', () => {
  let portfolioController: PortfolioController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          load: [configuration],
        }),
      ],
      controllers: [PortfolioController],
      providers: [PortfolioService, AppConfig],
    }).compile();

    portfolioController = app.get<PortfolioController>(PortfolioController);
  });

  describe('Portfolio Controller', () => {
    const portfolioAttributes: CreatePortfolioDto = {
      maxVarInDollar: 200,
      maxOpenTradeSameSymbolSameDirection: 1,
      nbComputePeriods: 20,
      zscore: 1.65,
      timeframe: '15m',
      nameId: 'crypto_15m',
    };

    const firstPortfolioPosition: AddPortfolioPositionDto = {
      pair: 'BTC/USDT',
      dollarAmount: 100,
      direction: 'long',
      dataSource: 'binance_future',
    };
    describe('When I create a portfolio', () => {
      it('then it should return an uuid string', () => {
        const portfolioUuid =
          portfolioController.create(portfolioAttributes).uuid;
        expect(isUuid(portfolioUuid)).toBeTruthy();
      });
    });

    describe('When I create a portfolio and i get all portfolios', () => {
      it('then it should return an array of portfolio with length 1 and uuid of the portfolio should be the same with the one get', () => {
        const portfolioUuid =
          portfolioController.create(portfolioAttributes).uuid;
        const portfolios = portfolioController.findAll();
        expect(portfolios.length).toBe(1);
        expect(portfolios[0].uuid).toBe(portfolioUuid);
      });

      describe('Given a portfolio and i had an allowed position', () => {
        it('then it should return an accepted response with uuid', async () => {
          const portfolioUuid =
            portfolioController.create(portfolioAttributes).uuid;
          const positionResponse = portfolioController.addPortfolioPosition(
            portfolioUuid,
            firstPortfolioPosition,
          );
          const positionUuid = (await positionResponse).uuid;
          expect(isUuid(positionUuid)).toBeTruthy();
          expect((await positionResponse).status).toBe('accepted');
        });
      });

      describe('Given I create a portfolio and i add an allowed position when i remove the position', () => {
        it('then it should return a validated response', async () => {
          const portfolioUuid =
            portfolioController.create(portfolioAttributes).uuid;
          const positionResponse = portfolioController.addPortfolioPosition(
            portfolioUuid,
            firstPortfolioPosition,
          );
          const positionUuid = (await positionResponse).uuid;
          portfolioController.removePortfolioPosition(
            portfolioUuid,
            positionUuid,
          );
        });
      });

      describe('Given I create a portfolio and i get it by nameId', () => {
        it('then it should return the portfolio this the same uuid', async () => {
          const portfolioUuid =
            portfolioController.create(portfolioAttributes).uuid;

          const findedPortfolioUuid = portfolioController.findByNameId(
            portfolioAttributes.nameId,
          ).uuid;

          expect(portfolioUuid).toBe(findedPortfolioUuid);
        });
      });

      describe('Given I create a portfolio of max mar is 200 and I change the var to 100 and i list all portfolios', () => {
        it('then the portfolio should have var of 100 dollar', async () => {
          const portfolioUuid =
            portfolioController.create(portfolioAttributes).uuid;
          const portfolioUpdateDto: UpdatePortfolioDto = {
            maxVarInDollar: 100,
          };
          portfolioController.update(portfolioUuid, portfolioUpdateDto);

          expect(portfolioController.findAll()[0].maxVarInDollar).toBe(100);
        });
      });
    });
  });
});
