import { Module } from '@nestjs/common';
import { PortfolioController } from './portfolios/portfolio.controller';
import { PortfolioService } from './portfolios/portfolio.service';

@Module({
  imports: [],
  controllers: [PortfolioController],
  providers: [PortfolioService],
})
export class AppModule {}
