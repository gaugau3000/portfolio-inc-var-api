import { ApiProperty } from '@nestjs/swagger';

export class createPortfolioResponse {
  @ApiProperty({
    example: 1,
  })
  id: number;
}
