import { dataSource, direction } from '../interfaces/interfaces';
import { IsNumber, IsString, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddPortfolioPositionDto {
  @ApiProperty({
    description: 'pair to add',
    example: 'BTC/USDT',
  })
  @IsString()
  pair: string;

  @ApiProperty({
    description: 'the position amount in dollar',
    example: 1000,
  })
  @IsNumber()
  @Min(0)
  dollarAmount: number;

  @ApiProperty({
    description: 'the direction of the position',
    example: 'long',
    enum: ['long', 'short'],
  })
  @IsString()
  direction: direction;

  @ApiProperty({
    description: 'the data source used to get the candles and compute the var',
    example: 'binance_futures',
    enum: ['binance_futures'],
  })
  @IsString()
  dataSource: dataSource;
}
