import {
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreatePortfolioDto } from './dto/create-portfolio.dto';

import { Portfolio } from './models/portfolio';
import { AddPortfolioPositionDto } from './dto/add-portfolio-position.dto';
import { UpdatePortfolioDto } from './dto/update-portfolio.dto';

@Injectable()
export class PortfolioService {
  private portfolios: Portfolio[] = [];

  update(portfolioUuid: string, updateUserDto: UpdatePortfolioDto) {
    const portfolio = this.portfolios.find(
      (portfolio) => portfolio.state.uuid == portfolioUuid,
    );

    if (portfolio === undefined)
      throw new NotFoundException(
        `The portfolio with id ${portfolioUuid} has not been found`,
      );

    updateUserDto.maxVarInDollar &&
      (portfolio.constraints.maxVarInDollar = updateUserDto.maxVarInDollar);
    updateUserDto.maxOpenTradeSameSymbolSameDirection &&
      (portfolio.constraints.maxOpenTradeSameSymbolSameDirection =
        updateUserDto.maxOpenTradeSameSymbolSameDirection);
  }

  findAll(): Portfolio[] {
    return this.portfolios;
  }

  findByNameId(portfolioNameId: string): Portfolio {
    const findedPortfolio = this.portfolios.find(
      (portfolio) => portfolio.params.nameId === portfolioNameId,
    );

    if (findedPortfolio === undefined)
      throw new NotFoundException(
        `The portfolio with nameId ${portfolioNameId} has not been found`,
      );

    return findedPortfolio;
  }

  delete(uuid: string) {
    this.portfolios = this.portfolios.filter(
      (portfolio) => portfolio.state.uuid !== uuid,
    );
  }

  async removePortfolioPosition(portfolioId: string, positionId: string) {
    const portfolio = this.portfolios.find(
      (portfolio) => portfolio.state.uuid == portfolioId,
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
      (portfolio) => portfolio.state.uuid === uuid,
    );

    if (portfolio === undefined)
      throw new NotFoundException(
        `The portfolio with id ${uuid} has not been found`,
      );

    const addPositionInfos = await portfolio.addPosition(addPortfolioPosition);

    if (addPositionInfos.status == 'rejected')
      throw new HttpException(
        {
          status: HttpStatus.FORBIDDEN,
          error: addPositionInfos.reason,
        },
        HttpStatus.FORBIDDEN,
      );

    delete addPositionInfos.reason;
    return addPositionInfos;
  }

  create(createPortfolioDto: CreatePortfolioDto): { uuid: string } {
    const hasNameIdInPortfolios = this.portfolios.some(
      (portfolio) =>
        portfolio.params.nameId === createPortfolioDto.params.nameId,
    );
    if (hasNameIdInPortfolios)
      throw new ConflictException(
        `A portfolio with this name already exist, please find another one`,
      );

    const portfolio = new Portfolio(createPortfolioDto);

    this.portfolios.push(portfolio);

    return { uuid: portfolio.state.uuid };
  }
}
