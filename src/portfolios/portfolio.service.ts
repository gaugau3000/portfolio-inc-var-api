import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreatePortfolioDto } from './dto/create-portfolio.dto';

import { Portfolio } from './models/portfolio';
import { AddPortfolioPositionDto } from './dto/add-portfolio-position.dto';

@Injectable()
export class PortfolioService {
  private portfolios: Portfolio[] = [];

  findAll(): Portfolio[] {
    return this.portfolios;
  }

  delete(uuid: string) {
    this.portfolios = this.portfolios.filter(
      (portfolio) => portfolio.uuid !== uuid,
    );
  }

  removePortfolioPosition(portfolioId: string, positionId: string) {
    const portfolio = this.portfolios.find(
      (portfolio) => portfolio.uuid == portfolioId,
    );

    if (portfolio === undefined)
      throw new NotFoundException(
        `The portfolio with id ${portfolioId} has not been found`,
      );

    return portfolio.removePosition(positionId);
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
