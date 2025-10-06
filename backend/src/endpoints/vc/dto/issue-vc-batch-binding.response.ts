import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class IssueVcBindingBatchResultDto {
  @ApiProperty({ example: 'success', enum: ['success', 'error'] })
  status: string;

  @ApiPropertyOptional({ example: 'urn:vc:twin:laser-001', description: 'Verifiable Credential ID (if success)' })
  vcId?: string;

  @ApiPropertyOptional({ example: 'urn:ifric:laser-001', description: 'URN of the binding (if success)' })
  bindingUrn?: string;

  @ApiPropertyOptional({ example: '0.0.45678', description: 'HCS binding topic ID (if success)' })
  bindingTopicId?: string;

  @ApiPropertyOptional({ example: '42', description: 'HCS sequence number (if success)' })
  sequenceNumber?: string;

  @ApiPropertyOptional({ description: 'The signed VC payload (if success)' })
  vc?: object;

  @ApiPropertyOptional({ example: 'Failed to issue VC for urn:twin:laser-001: invalid key' })
  message?: string;
}



export class IssueVcBindingBatchResponseDto {
  @ApiProperty({
    type: [IssueVcBindingBatchResultDto],
    description: 'Results per twinUrn, indicating success or error',
  })
  results: IssueVcBindingBatchResultDto[];
}
