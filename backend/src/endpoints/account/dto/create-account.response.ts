import { ApiProperty } from '@nestjs/swagger';

export class CreateAccountResponse {
  @ApiProperty({ example: '0.0.123456', description: 'Hedera account ID' })
  accountId: string;

  @ApiProperty({ example: 'did:hedera:0.0.123456', description: 'DID assigned to this account' })
  did: string;

  @ApiProperty({ example: '0.0.78910', description: 'File ID where the DID document is stored in HFS' })
  fileId: string;

  @ApiProperty({
    description: 'Key pair used to generate the account',
    example: {
      publicKey: '302a300506032b6570032100a1b2c...',
      privateKey: '302e020100300506032b657004220420abc123...',
    },
  })
  keyPair: {
    publicKey: string;
    privateKey: string;
  };
}