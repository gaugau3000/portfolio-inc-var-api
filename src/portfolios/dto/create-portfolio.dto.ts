import { timeframe } from '../interfaces/interfaces';
import { IsInt, IsNumber, IsString, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePortfolioDto {
  @ApiProperty({
    description:
      'The max value at risk in dollar you would like to set for your portfolio',
    example: 1000,
  })
  @IsNumber()
  @Min(0)
  maxVarInDollar: number;

  @ApiProperty({
    description:
      'The maximum of open positions for a pair in the same direction (if 1 then you can open only one BTC/USDT long, the second opportunity with BTC/USDT long will be rejected)',
    example: 1,
  })
  @IsNumber()
  @Min(1)
  @IsInt()
  maxOpenTradeSameSymbolSameDirection: number;

  @ApiProperty({
    description:
      'The number of periods to compute the correlation and standard deviation of the portfolio var',
    example: 20,
  })
  @IsNumber()
  @Min(1)
  @IsInt()
  nbComputePeriods: number;

  @ApiProperty({
    description:
      'The zscore used for compute the portfolio var 1.645 for 90% confidence,1.96 for 95%,2.58 for 99%',
    example: 1.645,
  })
  @IsNumber()
  @Min(0)
  zscore: number;

  @IsString()
  @ApiProperty({
    description:
      'The timeframe used to compute correlation and standard deviation of the var',
    example: '15m',
  })
  timeframe: timeframe;
}
