import { dataSource, direction } from '../interfaces/interfaces';
import { IsNumber, IsString, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddPortfolioPositionDto {
  @ApiProperty({
    description: 'the pair you would like to add to your portfolio',
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
  })
  @IsString()
  direction: direction;

  @ApiProperty({
    description: 'the data source used to get the candles and compute the var',
    example: 'binance_future',
  })
  @IsString()
  dataSource: dataSource;
}
