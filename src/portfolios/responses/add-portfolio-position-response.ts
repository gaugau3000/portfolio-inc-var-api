import { ApiProperty } from '@nestjs/swagger';

export class addPortfolioPositionResponse {
  @ApiProperty({
    example: 'success',
    description: 'position allowed to be add in portfolio',
  })
  status: string;

  @ApiProperty({
    example: 1,
    description: 'id of the position',
  })
  id?: number;
}
