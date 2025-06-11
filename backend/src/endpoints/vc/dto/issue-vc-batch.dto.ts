import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class VcTwinEntry {
    @ApiProperty({ example: 'urn:twin:laser-001' })
    twinUrn: string;

    @ApiProperty({ example: 'active', required: false })
    status?: string;
}

export class IssueVcBatchDto {
    @ApiProperty({ example: 'did:hedera:0.0.12345' })
    holderDid: string;

    @ApiProperty({ example: '0.0.45678' })
    subAccountId: string;

    @ApiProperty({ example: '302e020100300506032b657004220420...', description: 'Private key in hex or PEM format' })
    privateKey: string;

    @ApiPropertyOptional({ description: 'Location of the twin', example: 'Germany' })
    location?: string;

    @ApiProperty({
        type: [VcTwinEntry],
        description: 'List of twins with their statuses',
    })
    twins: VcTwinEntry[];
}