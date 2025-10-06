import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class IssueVcBindingDto {
  @ApiProperty({ example: 'did:hedera:0.0.12345' })
  producerDid: string;

  @ApiProperty({ example: '0.0.45678' })
  producerSubAccountId: string;

  @ApiProperty({ example: '302e020100300506032b657004220420...', description: 'Private key in hex or PEM format' })
  privateKey: string;

  @ApiPropertyOptional({ description: 'Location of the twin', example: 'Germany' })
  location?: string;

  @ApiProperty({ description: 'Status of the twin', example: 'active' })
  status: string;

  @ApiProperty({ example: 'urn:ifric:0000' })
  bindingUrn: string;

  @ApiProperty({ example: 'did:hedera:abc-001' })
  consumerDid: string;

  @ApiProperty({ example: '01-01-2025' })
  dateOfExpiry: string;
}