import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class BindingEntry {
    @ApiProperty({ example: 'urn:ifric:laser-001' })
    bindingUrn: string;

    @ApiProperty({ example: 'active', required: false })
    status?: string;

    @ApiProperty({ example: 'did:hedera:abc-001' })
    consumerDid: string;

    @ApiProperty({ example: '01-01-2025' })
    dateOfExpiry: string;

    @ApiProperty({ example: 'urn:ifric:laser-001', description: 'URN of the twin' })
    twinUrn: string;
}

export class IssueVcBindingBatchDto {
    @ApiProperty({ example: 'did:hedera:0.0.12345' })
    producerDid: string;

    @ApiProperty({ example: '0.0.45678' })
    producerSubAccountId: string;

    @ApiProperty({ example: '302e020100300506032b657004220420...', description: 'Private key in hex or PEM format' })
    privateKey: string;

    @ApiPropertyOptional({ description: 'Location of the twin', example: 'Germany' })
    location?: string;

    @ApiProperty({
        type: [BindingEntry],
        description: 'List of bindings with their metadata',
    })
    bindingIds: BindingEntry[];
}