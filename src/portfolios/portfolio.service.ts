import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreatePortfolioDto } from './dto/create-portfolio.dto';

import { Portfolio } from './models/portfolio';
import { AddPortfolioPositionDto } from './dto/add-portfolio-position.dto';
import { UpdatePortfolioDto } from './dto/update-portfolio.dto';

@Injectable()
export class PortfolioService {
  update(portfolioUuid: string, updateUserDto: UpdatePortfolioDto) {
    const portfolio = this.portfolios.find(
      (portfolio) => portfolio.uuid == portfolioUuid,
    );

    if (portfolio === undefined)
      throw new NotFoundException(
        `The portfolio with id ${portfolioUuid} has not been found`,
      );

    updateUserDto.maxVarInDollar &&
      (portfolio.maxVarInDollar = updateUserDto.maxVarInDollar);
    updateUserDto.maxOpenTradeSameSymbolSameDirection &&
      (portfolio.maxOpenTradeSameSymbolSameDirection =
        updateUserDto.maxOpenTradeSameSymbolSameDirection);
  }
  private portfolios: Portfolio[] = [];

  findAll(): Portfolio[] {
    return this.portfolios;
  }

  findByNameId(portfolioNameId: string): Portfolio {
    const findedPortfolio = this.portfolios.find(
      (portfolio) => portfolio.nameId === portfolioNameId,
    );

    if (findedPortfolio === undefined)
      throw new NotFoundException(
        `The portfolio with nameId ${portfolioNameId} has not been found`,
      );

    return findedPortfolio;
  }

  delete(uuid: string) {
    this.portfolios = this.portfolios.filter(
      (portfolio) => portfolio.uuid !== uuid,
    );
  }

  async removePortfolioPosition(portfolioId: string, positionId: string) {
    const portfolio = this.portfolios.find(
      (portfolio) => portfolio.uuid == portfolioId,
    );

    if (portfolio === undefined)
      throw new NotFoundException(
        `The portfolio with id ${portfolioId} has not been found`,
      );

    return await portfolio.removePosition(positionId);
  }

  async addPortfolioPosition(
    uuid: string,
    addPortfolioPosition: AddPortfolioPositionDto,
  ): Promise<import('./interfaces/interfaces').addPositionResponse> {
    const portfolio = this.portfolios.find(
      (portfolio) => portfolio.uuid === uuid,
    );

    if (portfolio === undefined)
      throw new NotFoundException(
        `The portfolio with id ${uuid} has not been found`,
      );

    return await portfolio.addPosition(addPortfolioPosition);
  }

  create(createPortfolioDto: CreatePortfolioDto): { uuid: string } {
    const hasNameIdInPortfolios = this.portfolios.some(
      (portfolio) => portfolio.nameId === createPortfolioDto.nameId,
    );
    if (hasNameIdInPortfolios)
      throw new ConflictException(
        `A portfolio with this name already exist, please find another one`,
      );

    const portfolio = new Portfolio(createPortfolioDto);
    this.portfolios.push(portfolio);

    return { uuid: portfolio.uuid };
  }
}
