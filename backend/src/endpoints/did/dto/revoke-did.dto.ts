import { ApiProperty } from "@nestjs/swagger";

// dto/create-account.dto.ts
export class RevokeDidDto {
    @ApiProperty({
        description: 'File ID of the DID document to revoke',
        example: '0.0.12345678',
        required: true,
        type: String
    })
    fileId: string; // unique user/company identifier
    @ApiProperty({
        description: 'Reason for revocation',
        example: 'User requested revocation',
        required: true,
        type: String
    })
    revocationReason: string; // reason for revocation
}