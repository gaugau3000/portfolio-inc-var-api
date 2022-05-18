import { Controller, Post, Body, Param, Delete } from '@nestjs/common';
import { CreatePortfolioDto } from './dto/create-portfolio.dto';
import { AddPortfolioPositionDto } from './dto/add-portfolio-position.dto';
import { PortfolioService } from './portfolio.service';
import { addPositionResponse } from './interfaces/interfaces';

@Controller('portfolios')
export class PortfolioController {
  constructor(private readonly portfolioService: PortfolioService) {}

  @Post()
  create(@Body() createPortfolioDto: CreatePortfolioDto): { uuid: string } {
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
  ): Promise<addPositionResponse> {
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
