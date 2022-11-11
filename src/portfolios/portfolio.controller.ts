import {
  Controller,
  Post,
  Body,
  Param,
  Delete,
  Get,
  ClassSerializerInterceptor,
  UseInterceptors,
  Query,
  Patch,
} from '@nestjs/common';
import { CreatePortfolioDto } from './dto/create-portfolio.dto';
import { AddPortfolioPositionDto } from './dto/add-portfolio-position.dto';
import { PortfolioService } from './portfolio.service';
import { createPortfolioResponse } from './responses/create-portfolio-response';
import { Portfolio } from './models/portfolio';
import { UpdatePortfolioDto } from './dto/update-portfolio.dto';
import { addPositionResponse } from './interfaces/interfaces';
import { Position } from '@prisma/client';

@Controller('portfolios')
export class PortfolioController {
  constructor(private readonly portfolioService: PortfolioService) { }

  @Post()
  async create(
    @Body() createPortfolioDto: CreatePortfolioDto,
  ): Promise<createPortfolioResponse> {
    return await this.portfolioService.create(createPortfolioDto);
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Get()
  async findAll(): Promise<Portfolio[]> {
    return await this.portfolioService.findAll();
  }

  @Get('findByName')
  async findByNameId(
    @Query('portfolio_name_id') portfolioNameId: string,
  ): Promise<Portfolio> {
    return await this.portfolioService.findByNameId(portfolioNameId);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updatePortfolioDto: UpdatePortfolioDto,
  ) {
    return await this.portfolioService.update(parseInt(id), updatePortfolioDto);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return await this.portfolioService.delete(parseInt(id));
  }

  @Post(':id/positions')
  async addPortfolioPosition(
    @Param('id') id: string,
    @Body() addPortfolioPosition: AddPortfolioPositionDto,
  ): Promise<addPositionResponse> {
    return await this.portfolioService.addPortfolioPosition(
      parseInt(id),
      addPortfolioPosition,
    );
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Get(':id/positions/findByStrategy')
  async findPortfolioPositionsByStrategy(
    @Param('id') id: string,
    @Query('strategy') strategy: string,
  ): Promise<Position[]> {
    return await this.portfolioService.findPortfolioPositionsByStrategy(
      parseInt(id),
      strategy,
    );
  }

  @Delete('positions/:positionId')
  async removePortfolioPosition(
    @Param('positionId') positionId: string,
  ): Promise<void> {
    return await this.portfolioService.removePortfolioPosition(
      parseInt(positionId),
    );
  }
}
