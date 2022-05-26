import { IsInt, IsNumber, IsOptional, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdatePortfolioDto {
  @ApiProperty({
    description:
      'The max value at risk in dollar you would like to change for your portfolio',
    example: 1000,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  maxVarInDollar?: number;

  @ApiProperty({
    description:
      'The maximum of open positions for a pair in the same direction you would like to change (if 1 then you can open only one BTC/USDT long, the second opportunity with BTC/USDT long will be rejected)',
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @IsInt()
  maxOpenTradeSameSymbolSameDirection?: number;
}
