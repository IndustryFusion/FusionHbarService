import { ApiProperty } from '@nestjs/swagger';

export class CreateTopicDto {
  @ApiProperty({ description: 'Region to associate with the new topic', example: 'EU' })
  region: string;
}