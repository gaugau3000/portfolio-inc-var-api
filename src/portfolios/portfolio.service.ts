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
} from '@prisma/client';
import {
  portfolioDtoToPrismaPortfolioCreateInput,
  prismaPortfolioToPortfolio,
} from '../portfolios/pure_functions/convert-portfolio';
import { Portfolio } from './models/portfolio';

@Injectable()
export class PortfolioService {
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
    // const portfolio = this.portfolios.find(
    //   (portfolio) => portfolio.state.id == portfolioId,
    // );

    // if (portfolio === undefined)
    //   throw new NotFoundException(
    //     `The portfolio with id ${portfolioId} has not been found`,
    //   );
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

  delete(id: number) {
    this.prisma.portfolio.delete({ where: { id: id } });
    // this.portfolios = this.portfolios.filter(
    //   (portfolio) => portfolio.state.id !== id,
    // );
  }

  async removePortfolioPosition(portfolioId: number, positionId: number) {
    this.prisma.position.delete({ where: { id: positionId } });

    // const portfolio = this.portfolios.find(
    //   (portfolio) => portfolio.state.id == portfolioId,
    // );

    // if (portfolio === undefined)
    //   throw new NotFoundException(
    //     `The portfolio with id ${portfolioId} has not been found`,
    //   );

    // return await portfolio.removePosition(positionId);
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

    // const portfolio = this.portfolios.find(
    //   (portfolio) => portfolio.state.id === id,
    // );

    // if (portfolio === undefined)
    //   throw new NotFoundException(
    //     `The portfolio with id ${id} has not been found`,
    //   );

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
}
