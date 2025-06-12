import { Body, Controller, Get, HttpException, HttpStatus, Param, Post } from '@nestjs/common';
import { DidService } from './did.service';
import { ApiBody, ApiOkResponse, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { RevokeDidDto } from './dto/revoke-did.dto';

@Controller('did')
export class DidController {
    constructor(private readonly didService: DidService) { }

    @Post('revoke-did')
    @ApiOperation({ summary: 'Revoke the DID with new contents' })
    @ApiBody({ type: RevokeDidDto })
    @ApiResponse({
        status: 201,
        description: 'Returns the new Hedera account ID, DID, fileId, and keyPair',
    })
    @ApiResponse({
        status: 500,
        description: 'Internal server error during subaccount creation',
    })
    async revokeDid(@Body() dto: RevokeDidDto): Promise<Record<string, any>> {
        try {
            return await this.didService.revokeDid(dto.fileId, dto.revocationReason);
        } catch (error) {
            console.error('Account creation failed:', error);
            throw new HttpException(
                'Failed to create Hedera subaccount and DID',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    @Get('did/:fileId/status')
    @ApiParam({ name: 'fileId', type: String })
    @ApiOkResponse({ schema: { example: { revoked: false } } })
    async getDidStatus(@Param('fileId') fileId: string) {
        const revoked = await this.didService.isDidRevoked(fileId);
        return { revoked };
    }
}
