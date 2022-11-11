import { Test, TestingModule } from '@nestjs/testing';
import { CreatePortfolioDto } from './dto/create-portfolio.dto';
import { PortfolioController } from './portfolio.controller';
import { PortfolioService } from './portfolio.service';
import { AddPortfolioPositionDto } from './dto/add-portfolio-position.dto';
import { AppConfig } from './models/app-config';
import { ConfigModule } from '@nestjs/config';
import configuration from '../config/configuration';
import { UpdatePortfolioDto } from './dto/update-portfolio.dto';
import { PrismaService } from '../prisma.service';
import {
  Portfolio as PrismaPortfolio,
  Position as PrismaPosition,
} from '@prisma/client';
import { SupportedExchanges } from './interfaces/interfaces';
import { createPortfolioResponse } from './responses/create-portfolio-response';

describe('PortfolioController', () => {
  let prisma: PrismaService;
  let portfolioController: PortfolioController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          load: [configuration],
        }),
      ],
      controllers: [PortfolioController],
      providers: [PortfolioService, AppConfig, PrismaService],
    }).compile();

    portfolioController = app.get<PortfolioController>(PortfolioController);
    prisma = app.get<PrismaService>(PrismaService);
  });

  describe('Portfolio Controller', () => {
    const portfolioAttributes: CreatePortfolioDto = {
      params: {
        nbComputePeriods: 20,
        zscore: 1.65,
        timeframe: '1m',
        nameId: 'crypto_15m',
      },
      constraints: {
        maxVarInDollar: 200,
        maxOpenTradeSameSymbolSameDirection: 1,
      },
    };

    const prismaPortfolio: PrismaPortfolio = {
      id: 1,
      maxVarInDollar: 200,
      maxOpenTradeSameSymbolSameDirection: 1,
      nbComputePeriods: 20,
      zscore: 1.65,
      timeframe: '1m',
      nameId: 'crypto_15m',
    };

    const firstPortfolioPosition: AddPortfolioPositionDto = {
      pair: 'BTC/USDT',
      dollarAmount: 100,
      direction: 'long',
      dataSource: SupportedExchanges.BinanceFutures,
      strategy: 'MaCrossOver',
    };

    describe('When I create a portfolio then then', () => {
      it('should return response with id=1', async () => {
        prisma.portfolio.create = jest.fn().mockReturnValue(prismaPortfolio);

        const portfolio: createPortfolioResponse =
          await portfolioController.create(portfolioAttributes);

        expect(portfolio.id).toBe(1);
      });
    });

    describe('When I create a portfolio and i get all portfolios then', () => {
      it('should return a list with 1 portfolio and id should be 1', async () => {
        prisma.portfolio.create = jest.fn().mockReturnValue(prismaPortfolio);
        prisma.portfolio.findMany = jest
          .fn()
          .mockReturnValue([{ ...prismaPortfolio, positions: [] }]);

        const portfolioId = (
          await portfolioController.create(portfolioAttributes)
        ).id;
        const portfolios = await portfolioController.findAll();
        expect(portfolios.length).toBe(1);
        expect(portfolios[0].state.id).toBe(portfolioId);
      });

      describe('Given a portfolio when i had an allowed position then', () => {
        it('should return an accepted status and id should be 1', async () => {
          prisma.portfolio.create = jest.fn().mockReturnValue(prismaPortfolio);
          prisma.portfolio.findUnique = jest
            .fn()
            .mockReturnValue({ ...prismaPortfolio, positions: [] });
          prisma.position.create = jest.fn().mockReturnValue({
            id: 1,
            pair: 'BTC/USDT',
            dollarAmount: 100,
            direction: 'long',
            dataSource: SupportedExchanges.BinanceFutures,
            portfolioId: 1,
          });

          const portfolioId = (
            await portfolioController.create(portfolioAttributes)
          ).id;
          const positionResponse =
            await portfolioController.addPortfolioPosition(
              portfolioId.toString(),
              firstPortfolioPosition,
            );

          expect(positionResponse.id).toBe(1);
          expect(positionResponse.status).toBe('accepted');
        });
      });

      describe('Given a portfolio and i add an allowed position when i remove the position then', () => {
        it('should return undefined ', async () => {
          prisma.portfolio.create = jest.fn().mockReturnValue(prismaPortfolio);
          prisma.portfolio.findUnique = jest
            .fn()
            .mockReturnValue({ ...prismaPortfolio, positions: [] });
          prisma.position.create = jest.fn().mockReturnValue({
            id: 1,
            pair: 'BTC/USDT',
            dollarAmount: 100,
            direction: 'long',
            dataSource: SupportedExchanges.BinanceFutures,
            portfolioId: 1,
            strategy: 'MaCrossOver',
          });

          prisma.position.delete = jest.fn().mockReturnValue(undefined);

          const portfolioId = (
            await portfolioController.create(portfolioAttributes)
          ).id;
          const positionResponse =
            await portfolioController.addPortfolioPosition(
              portfolioId.toString(),
              firstPortfolioPosition,
            );

          expect(
            portfolioController.removePortfolioPosition(
              positionResponse.id.toString(),
            ),
          ).toBeUndefined;
        });
      });

      describe('Given I create a portfolio with id=1 when i find it using nameId then', () => {
        it('should return the portfolio with id=1', async () => {
          prisma.portfolio.create = jest.fn().mockReturnValue(prismaPortfolio);

          const portfolioId = (
            await portfolioController.create(portfolioAttributes)
          ).id;

          const findPrismaPortfolio: PrismaPortfolio & {
            positions: PrismaPosition[];
          } = {
            ...prismaPortfolio,
            positions: [
              {
                portfolioId: 1,
                id: 1,
                pair: 'BTC/USDT',
                dollarAmount: 100,
                direction: 'long',
                dataSource: SupportedExchanges.BinanceFutures,
                strategy: 'MaCrossOver',
              },
            ],
          };

          prisma.portfolio.findUnique = jest
            .fn()
            .mockReturnValue(findPrismaPortfolio);

          const findedPortfolioId = (
            await portfolioController.findByNameId(
              portfolioAttributes.params.nameId,
            )
          ).state.id;

          expect(portfolioId).toBe(findedPortfolioId);
        });
      });

      describe('Given I have a portfolio of max mar is 200 and I update the var to 100 when i list all portfolios then the first portfolio finded', () => {
        it('should have var of 100 dollar', async () => {
          prisma.portfolio.create = jest.fn().mockReturnValue(prismaPortfolio);
          const updatePortfolio = prismaPortfolio;
          updatePortfolio['maxVarInDollar'] = 100;
          updatePortfolio['positions'] = [];
          prisma.portfolio.update = jest.fn().mockReturnValue(updatePortfolio);
          prisma.portfolio.findMany = jest
            .fn()
            .mockReturnValue([updatePortfolio]);
          const portfolioId = (
            await portfolioController.create(portfolioAttributes)
          ).id;
          const portfolioUpdateDto: UpdatePortfolioDto = {
            maxVarInDollar: 100,
          };
          portfolioController.update(
            portfolioId.toString(),
            portfolioUpdateDto,
          );

          expect(
            (await portfolioController.findAll())[0].constraints.maxVarInDollar,
          ).toBe(100);
        });
      });
    });
  });
});
