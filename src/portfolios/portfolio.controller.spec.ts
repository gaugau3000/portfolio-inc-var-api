import { Test, TestingModule } from '@nestjs/testing';
import { CreatePortfolioDto } from './dto/create-portfolio.dto';
import { PortfolioController } from './portfolio.controller';
import { PortfolioService } from './portfolio.service';
import { isUuid } from 'uuidv4';
import { AddPortfolioPositionDto } from './dto/add-portfolio-position.dto';
import { AppConfig } from './models/app-config';
import { ConfigModule } from '@nestjs/config';
import configuration from '../config/configuration';

describe('PortfolioController', () => {
  let portfolioController: PortfolioController;

  beforeAll(async () => {
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
    let portfolioUuid = '';
    let positionUuid = '';
    describe('Create a portfolio', () => {
      it('should return an uuid string', () => {
        const portfolioAttributes: CreatePortfolioDto = {
          maxVarInDollar: 200,
          maxOpenTradeSameSymbolSameDirection: 1,
          nbComputePeriods: 20,
          zscore: 1.65,
          timeframe: '15m',
        };
        portfolioUuid = portfolioController.create(portfolioAttributes).uuid;
        expect(isUuid(portfolioUuid)).toBeTruthy();
      });
    });

    describe('Add an allowed position', () => {
      it('should return a validated response with uuid', async () => {
        const addPortfolioPosition: AddPortfolioPositionDto = {
          pair: 'BTC/USDT',
          dollarAmount: 100,
          direction: 'long',
          dataSource: 'binance_future',
        };
        const positionResponse = portfolioController.addPortfolioPosition(
          portfolioUuid,
          addPortfolioPosition,
        );
        positionUuid = (await positionResponse).uuid;
        expect(isUuid(positionUuid)).toBeTruthy();
        expect((await positionResponse).status).toBe('accepted');
      });
    });

    describe('Remove position', () => {
      it('should return a validated response', () => {
        portfolioController.removePortfolioPosition(
          portfolioUuid,
          positionUuid,
        );
      });
    });
  });
});
