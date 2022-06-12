import { ApiProperty } from '@nestjs/swagger';

export class createPortfolioResponse {
  @ApiProperty({
    example: '168cb24d-a2fb-4df5-8add-264ea7de9d6e',
  })
  id: number;
}
