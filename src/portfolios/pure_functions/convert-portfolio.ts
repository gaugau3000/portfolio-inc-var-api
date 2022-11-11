import {
  Prisma,
  Portfolio as PrismaPortfolio,
  Position as PrismaPosition,
} from '@prisma/client';
import { CreatePortfolioDto } from '../dto/create-portfolio.dto';
import { position, timeframe } from '../interfaces/interfaces';
import { Portfolio } from '../models/portfolio';

export function portfolioDtoToPrismaPortfolioCreateInput(
  createPortfolioDto: CreatePortfolioDto,
): Prisma.PortfolioCreateInput {
  return {
    maxVarInDollar: createPortfolioDto.constraints.maxVarInDollar,
    maxOpenTradeSameSymbolSameDirection:
      createPortfolioDto.constraints.maxOpenTradeSameSymbolSameDirection,
    nbComputePeriods: createPortfolioDto.params.nbComputePeriods,
    zscore: createPortfolioDto.params.zscore,
    timeframe: createPortfolioDto.params.timeframe,
    nameId: createPortfolioDto.params.nameId,
  };
}

export async function prismaPortfolioToPortfolio(
  prismaPortfolio: PrismaPortfolio & {
    positions: PrismaPosition[];
  },
): Promise<Portfolio> {
  const portfolio = new Portfolio({
    constraints: {
      maxVarInDollar: prismaPortfolio.maxVarInDollar,
      maxOpenTradeSameSymbolSameDirection:
        prismaPortfolio.maxOpenTradeSameSymbolSameDirection,
    },
    params: {
      nbComputePeriods: prismaPortfolio.nbComputePeriods,
      zscore: prismaPortfolio.zscore,
      timeframe: prismaPortfolio.timeframe as timeframe,
      nameId: prismaPortfolio.nameId,
    },
    state: {
      id: prismaPortfolio.id,
      positions: prismaPortfolio.positions as position[],
      valueAtRisk: 0,
    },
  });
  await portfolio.updateVar();
  return portfolio;
}

export interface portfolioConstraints {
  maxVarInDollar: number;
  maxOpenTradeSameSymbolSameDirection: number;
}

export interface portfolioParams {
  nbComputePeriods: number;
  zscore: number;
  timeframe: timeframe;
  nameId: string;
}

export interface portfolioState {
  id: string;
  positions: Array<position>;
  valueAtRisk: number;
}
