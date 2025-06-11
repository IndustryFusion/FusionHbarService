import { ApiProperty } from '@nestjs/swagger';
import { IssueVcBatchResultDto } from './issue-vc-batch-result.dto';

export class IssueVcBatchResponseDto {
  @ApiProperty({ example: 201 })
  status: number;

  @ApiProperty({ example: 'Batch VC issuance completed' })
  message: string;

  @ApiProperty({
    type: [IssueVcBatchResultDto],
    description: 'Results per twinUrn, indicating success or error',
  })
  results: IssueVcBatchResultDto[];
}