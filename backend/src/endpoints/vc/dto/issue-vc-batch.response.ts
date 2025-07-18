import { ApiProperty } from '@nestjs/swagger';
import { IssueVcBatchResultDto } from './issue-vc-batch-result.dto';

export class IssueVcBatchResponseDto {
  @ApiProperty({
    type: [IssueVcBatchResultDto],
    description: 'Results per twinUrn, indicating success or error',
  })
  results: IssueVcBatchResultDto[];
}
