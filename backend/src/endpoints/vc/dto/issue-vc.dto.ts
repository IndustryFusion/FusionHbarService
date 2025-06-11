import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class IssueVcDto {
  @ApiProperty({ description: 'DID of the VC holder', example: 'did:hedera:0.0.12345' })
  holderDid: string;

  @ApiProperty({ description: 'URN of the digital twin', example: 'urn:twin:laser-001' })
  twinUrn: string;

  @ApiPropertyOptional({ description: 'Location of the twin', example: 'Germany' })
  location?: string;

  @ApiPropertyOptional({ description: 'Status of the twin', example: 'active' })
  status?: string;

  @ApiProperty({ description: 'Private key of the owner in PEM or hex format', example: '302e020100300506032b657004220420...' })
  privateKey: string;

  @ApiProperty({ description: 'Sub-account ID of the digital twin owner', example: '0.0.98765' })
  subAccountId: string;
}