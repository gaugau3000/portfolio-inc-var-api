import {
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreatePortfolioDto } from './dto/create-portfolio.dto';

import { AddPortfolioPositionDto } from './dto/add-portfolio-position.dto';
import { UpdatePortfolioDto } from './dto/update-portfolio.dto';
import { PrismaService } from '../prisma.service';
import {
  Prisma,
  Portfolio as PrismaPortfolio,
  Position as PrismaPosition,
  Position,
} from '@prisma/client';
import {
  portfolioDtoToPrismaPortfolioCreateInput,
  prismaPortfolioToPortfolio,
} from '../portfolios/pure_functions/convert-portfolio';
import { Portfolio } from './models/portfolio';

@Injectable()
export class PortfolioService {
  removePort: any;
  constructor(private prisma: PrismaService) {}

  async create(
    createPortfolioDto: CreatePortfolioDto,
  ): Promise<{ id: number }> {
    const portfolioCreateInput: Prisma.PortfolioCreateInput =
      portfolioDtoToPrismaPortfolioCreateInput(createPortfolioDto);

    try {
      const prismaPortfolio: PrismaPortfolio =
        await this.prisma.portfolio.create({
          data: portfolioCreateInput,
        });
      return { id: prismaPortfolio.id };
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        // The .code property can be accessed in a type-safe manner
        if (e.code === 'P2002') {
          throw new ConflictException(
            `A portfolio with this name already exist, please find another one`,
          );
        }
      }
    }
  }

  update(portfolioId: number, updatePortfolioDto: UpdatePortfolioDto) {
    let updateData = {};

    if (updatePortfolioDto.maxVarInDollar)
      updateData = { maxVarInDollar: updatePortfolioDto.maxVarInDollar };
    if (updatePortfolioDto.maxOpenTradeSameSymbolSameDirection)
      updateData = {
        ...updateData,
        maxOpenTradeSameSymbolSameDirection:
          updatePortfolioDto.maxOpenTradeSameSymbolSameDirection,
      };

    return this.prisma.portfolio.update({
      data: updateData,
      where: { id: portfolioId },
    });
  }

  async findAll(): Promise<Portfolio[]> {
    const prismaPortfolios: (PrismaPortfolio & {
      positions: PrismaPosition[];
    })[] = await this.prisma.portfolio.findMany({
      include: {
        positions: true,
      },
    });

    const portfolios = await Promise.all(
      prismaPortfolios.map(async (prismaPortfolio) => {
        return prismaPortfolioToPortfolio(prismaPortfolio);
      }),
    );

    return portfolios;
  }

  async findByNameId(portfolioNameId: string): Promise<Portfolio> {
    const findPrismaPortfolio: PrismaPortfolio & {
      positions: PrismaPosition[];
    } = await this.prisma.portfolio.findUnique({
      where: { nameId: portfolioNameId },
      include: {
        positions: true,
      },
    });

    // if (findedPortfolio === undefined)
    //   throw new NotFoundException(
    //     `The portfolio with nameId ${portfolioNameId} has not been found`,
    //   );

    return prismaPortfolioToPortfolio(findPrismaPortfolio);
  }

  async delete(id: number) {
    try {
      await this.prisma.portfolio.delete({ where: { id: id } });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        // The .code property can be accessed in a type-safe manner
        if (e.code === 'P2016') {
          throw new NotFoundException(
            `Unable to delete portfolio with id ${id} : not found`,
          );
        }
      }
    }
  }

  async removePortfolioPosition(id: number) {
    try {
      await this.prisma.position.delete({ where: { id: id } });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        // The .code property can be accessed in a type-safe manner
        if (e.code === 'P2016') {
          throw new NotFoundException(
            `Unable to delete portfolio position with id ${id} : not found`,
          );
        }
      }
    }
  }

  async addPortfolioPosition(
    id: number,
    addPortfolioPosition: AddPortfolioPositionDto,
  ): Promise<import('./interfaces/interfaces').addPositionResponse> {
    const prismaPortfolio: PrismaPortfolio & {
      positions: PrismaPosition[];
    } = await this.prisma.portfolio.findUnique({
      where: { id },
      include: {
        positions: true,
      },
    });

    const portfolio = await prismaPortfolioToPortfolio(prismaPortfolio);

    const addPositionInfos = await portfolio.addPosition(addPortfolioPosition);

    if (addPositionInfos.status == 'rejected')
      throw new HttpException(
        {
          status: HttpStatus.FORBIDDEN,
          error: addPositionInfos.reason,
        },
        HttpStatus.FORBIDDEN,
      );

    const positionCreateInput: Prisma.PositionCreateInput = {
      pair: addPortfolioPosition.pair,
      dollarAmount: addPortfolioPosition.dollarAmount,
      direction: addPortfolioPosition.direction,
      dataSource: addPortfolioPosition.dataSource,
      ...(addPortfolioPosition.strategy && {
        strategy: addPortfolioPosition.strategy,
      }),
      Portfolio: {
        connect: { id: id },
      },
    };

    const prismaPosition = await this.prisma.position.create({
      data: positionCreateInput,
    });

    delete addPositionInfos.reason;
    addPositionInfos['id'] = prismaPosition.id;
    return addPositionInfos;
  }

  async findPortfolioPositionsByStrategy(
    portfolioId: number,
    strategy: string,
  ): Promise<Position[]> {
    try {
      return await this.prisma.position.findMany({
        where: {
          portfolioId: portfolioId,
          strategy: strategy,
        },
      });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        // The .code property can be accessed in a type-safe manner
        if (e.code === 'P2016') {
          throw new NotFoundException(
            `Unable to find portfolio with id ${portfolioId} : not found`,
          );
        }
      }
    }
  }
}
