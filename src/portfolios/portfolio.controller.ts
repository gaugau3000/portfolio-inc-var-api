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

@Controller('portfolios')
export class PortfolioController {
  constructor(private readonly portfolioService: PortfolioService) {}

  @Post()
  async create(
    @Body() createPortfolioDto: CreatePortfolioDto,
  ): Promise<createPortfolioResponse> {
    return this.portfolioService.create(createPortfolioDto);
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Get()
  async findAll(): Promise<Portfolio[]> {
    return this.portfolioService.findAll();
  }

  @Get('findByName')
  async findByNameId(
    @Query('portfolio_name_id') portfolioNameId: string,
  ): Promise<Portfolio> {
    return this.portfolioService.findByNameId(portfolioNameId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updatePortfolioDto: UpdatePortfolioDto,
  ) {
    return this.portfolioService.update(parseInt(id), updatePortfolioDto);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.portfolioService.delete(parseInt(id));
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

  @Delete('positions/:positionId')
  async removePortfolioPosition(
    @Param('positionId') positionId: string,
  ): Promise<void> {
    return await this.portfolioService.removePortfolioPosition(
      parseInt(positionId),
    );
  }
}
