import { Body, Controller, HttpException, HttpStatus, Post } from '@nestjs/common';
import { CreateAccountDto } from './dto/create-account.dto';
import { AccountService } from './account.service';
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CreateAccountResponse } from './dto/create-account.response';

@Controller('account')
export class AccountController {
    constructor(private readonly accountService: AccountService) { }

    @Post('create-subaccount')
    @ApiOperation({ summary: 'Create a Hedera subaccount and DID for a company or user' })
    @ApiBody({ type: CreateAccountDto })
    @ApiResponse({
        status: 201,
        description: 'Returns the new Hedera account ID, DID, fileId, and keyPair',
        type: CreateAccountResponse,
    })
    @ApiResponse({
        status: 500,
        description: 'Internal server error during subaccount creation',
    })
    async createSubAccount(@Body() dto: CreateAccountDto): Promise<CreateAccountResponse> {
        try {
            return await this.accountService.createSubAccount(dto.companyUrn);
        } catch (error) {
            console.error('Account creation failed:', error);
            throw new HttpException(
                'Failed to create Hedera subaccount and DID',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }
}
