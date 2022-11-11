import { IsDefined, IsInt, IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePortfolioConstraints {
  @ApiProperty({
    description: 'The max value at risk in dollar for your portfolio',
    example: 1000,
  })
  @IsDefined()
  @IsNumber()
  @Min(0)
  maxVarInDollar: number;

  @ApiProperty({
    description:
      'The maximum of open positions for a pair in the same direction (if 1 then you can open only one BTC/USDT long, the second opportunity with BTC/USDT long will be rejected)',
    example: 1,
  })
  @IsDefined()
  @IsNumber()
  @Min(1)
  @IsInt()
  maxOpenTradeSameSymbolSameDirection: number;
}
