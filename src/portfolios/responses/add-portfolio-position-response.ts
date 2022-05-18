import { ApiProperty } from '@nestjs/swagger';

export class addPortfolioPositionResponse {
  @ApiProperty({
    example: 'success',
    description: 'position allowed to be add in portfolio',
  })
  status: string;

  @ApiProperty({
    example: '168cb24d-a2fb-4df5-8add-264ea7de9d6e',
    description: 'uuid of the position',
  })
  uuid?: string;
}
