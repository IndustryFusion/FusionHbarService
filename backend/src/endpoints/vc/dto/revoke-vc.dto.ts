import { ApiProperty } from "@nestjs/swagger";

export class RevokeVcDto {
    @ApiProperty({
        description: 'Twin URN to revoke',
        example: 'urn:ifric:laser-001',
        required: true,
        type: String
    })
    twinUrn: string; // unique user/company identifier

    @ApiProperty({
        description: 'VC ID to revoke',
        example: 'urn:vc:product:laser-001',
        required: true,
        type: String
    })
    vcId: string; // unique VC identifier
    @ApiProperty({
        description: 'Reason for revocation',
        example: 'User requested revocation',
        required: true,
        type: String
    })
    revocationReason: string; // reason for revocation
}