import { ApiProperty } from '@nestjs/swagger';

export class CreateTopicResponseDto {
  @ApiProperty({ example: 201, description: 'HTTP status code' })
  status: number;

  @ApiProperty({ example: 'New topic created for EU region' })
  message: string;

  @ApiProperty({ example: 'EU', description: 'Region for which the topic was created' })
  region: string;

  @ApiProperty({ example: '0.0.45678', description: 'Created HCS topic ID' })
  topicId: string;

  @ApiProperty({ example: 'VCs for EU products', description: 'Memo set on the HCS topic' })
  memo: string;
}