import { Test, TestingModule } from '@nestjs/testing';
import { CreatePortfolioDto } from './dto/create-portfolio.dto';
import { PortfolioController } from './portfolio.controller';
import { PortfolioService } from './portfolio.service';
import { isUuid } from 'uuidv4';
import { AddPortfolioPositionDto } from './dto/add-portfolio-position.dto';

describe('PortfolioController', () => {
  let portfolioController: PortfolioController;

  beforeAll(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [PortfolioController],
      providers: [PortfolioService],
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
      it('should return a validated response with uuid', () => {
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
        positionUuid = positionResponse.uuid;
        expect(isUuid(positionUuid)).toBeTruthy();
        expect(positionResponse.status).toBe('accepted');
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
