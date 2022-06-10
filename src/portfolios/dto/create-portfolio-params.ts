import { portfolioParams, timeframe } from '../interfaces/interfaces';
import { IsDefined, IsInt, IsNumber, IsString, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePortfolioParams {
  constructor(params: portfolioParams) {
    this.nameId = params.nameId;
    this.nbComputePeriods = params.nbComputePeriods;
    this.timeframe = params.timeframe;
    this.zscore = params.zscore;
  }

  @ApiProperty({
    description:
      'The number of periods to compute the correlation and standard deviation of the portfolio var',
    example: 20,
  })
  @IsDefined()
  @IsNumber()
  @Min(1)
  @IsInt()
  nbComputePeriods: number;

  @ApiProperty({
    description:
      'The zscore used for compute the portfolio var 1.645 for 90% confidence, 1.96 for 95%, 2.58 for 99%',
    example: 1.645,
  })
  @IsDefined()
  @IsNumber()
  @Min(0)
  zscore: number;

  @IsDefined()
  @IsString()
  @ApiProperty({
    description:
      'The timeframe used to compute correlation and standard deviation of the var',
    example: '15m',
  })
  timeframe: timeframe;

  @IsDefined()
  @IsString()
  @ApiProperty({
    description: 'Give the portfolio a unique explicit name',
    example: 'crypto_15m',
  })
  nameId: string;
}
