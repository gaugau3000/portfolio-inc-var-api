import { Module } from '@nestjs/common';
import { PortfolioController } from './portfolios/portfolio.controller';
import { PortfolioService } from './portfolios/portfolio.service';
import { ConfigModule } from '@nestjs/config';
import configuration from './config/configuration';
import { AppConfig } from './portfolios/models/app-config';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
    }),
  ],
  controllers: [PortfolioController],
  providers: [PortfolioService, AppConfig],
})
export class AppModule {}
