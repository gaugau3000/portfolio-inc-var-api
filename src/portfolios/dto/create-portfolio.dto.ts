import { ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreatePortfolioParams } from './create-portfolio-params';
import { CreatePortfolioConstraints } from './create-portfolio-constraints';

export class CreatePortfolioDto {
  @ValidateNested()
  @Type(() => CreatePortfolioParams)
  params: CreatePortfolioParams;

  @ValidateNested()
  @Type(() => CreatePortfolioConstraints)
  constraints: CreatePortfolioConstraints;
}
