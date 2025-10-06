import { ApiProperty } from '@nestjs/swagger';

export class IssueVcBindingResponseDto {
    @ApiProperty({ example: 201, description: 'HTTP status code' })
    status: number;

    @ApiProperty({ example: 'Verifiable Credential issued successfully' })
    message: string;

    @ApiProperty({ example: 'urn:ifric:laser-001', description: 'URN of the company/user' })
    bindingUrn: string;

    @ApiProperty({ example: 'urn:vc:product:laser-001' })
    vcId: string;

    @ApiProperty({ example: '0.0.45678', description: 'Hedera Consensus Service topic ID' })
    topicId: string;

    @ApiProperty({ example: '42', description: 'Sequence number in the HCS topic' })
    sequenceNumber: string;

    @ApiProperty({
        description: 'The Verifiable Credential including the proof'
    })
    vc: object; // You can define a full VC interface if needed
}