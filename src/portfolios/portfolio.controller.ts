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
} from '@nestjs/common';
import { CreatePortfolioDto } from './dto/create-portfolio.dto';
import { AddPortfolioPositionDto } from './dto/add-portfolio-position.dto';
import { PortfolioService } from './portfolio.service';
import { createPortfolioResponse } from './responses/create-portfolio-response';
import { addPortfolioPositionResponse } from './responses/add-portfolio-position-response';
import { Portfolio } from './models/portfolio';

@Controller('portfolios')
export class PortfolioController {
  constructor(private readonly portfolioService: PortfolioService) {}

  @UseInterceptors(ClassSerializerInterceptor)
  @Get()
  findAll(): Array<Portfolio> {
    return this.portfolioService.findAll();
  }

  @Get('findByName')
  findByNameId(@Query('portfolio_name_id') portfolioNameId: string): Portfolio {
    return this.portfolioService.findByNameId(portfolioNameId);
  }

  @Post()
  create(
    @Body() createPortfolioDto: CreatePortfolioDto,
  ): createPortfolioResponse {
    return this.portfolioService.create(createPortfolioDto);
  }

  @Delete(':uuid')
  delete(@Param('uuid') uuid: string) {
    return this.portfolioService.delete(uuid);
  }

  @Post(':id/positions')
  async addPortfolioPosition(
    @Param('id') id: string,
    @Body() addPortfolioPosition: AddPortfolioPositionDto,
  ): Promise<addPortfolioPositionResponse> {
    return await this.portfolioService.addPortfolioPosition(
      id,
      addPortfolioPosition,
    );
  }

  @Delete(':portfolioId/positions/:positionId')
  removePortfolioPosition(
    @Param('portfolioId') portfolioId: string,
    @Param('positionId') positionId: string,
  ) {
    return this.portfolioService.removePortfolioPosition(
      portfolioId,
      positionId,
    );
  }
}
