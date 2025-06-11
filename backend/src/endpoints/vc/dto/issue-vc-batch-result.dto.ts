import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class IssueVcBatchResultDto {
  @ApiProperty({ example: 'success', enum: ['success', 'error'] })
  status: 'success' | 'error';

  @ApiPropertyOptional({ example: 'urn:vc:twin:laser-001', description: 'Verifiable Credential ID (if success)' })
  vcId?: string;

  @ApiPropertyOptional({ example: '0.0.45678', description: 'HCS topic ID (if success)' })
  topicId?: string;

  @ApiPropertyOptional({ example: '42', description: 'HCS sequence number (if success)' })
  sequenceNumber?: string;

  @ApiPropertyOptional({ description: 'The signed VC payload (if success)' })
  vc?: object;

  @ApiPropertyOptional({ example: 'Failed to issue VC for urn:twin:laser-001: invalid key' })
  message?: string;
}