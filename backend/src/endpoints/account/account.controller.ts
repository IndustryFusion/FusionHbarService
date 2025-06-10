import { Body, Controller, Post } from '@nestjs/common';
import { CreateAccountDto } from './dto/create-account.dto';
import { AccountService } from './account.service';

@Controller('account')
export class AccountController {
    constructor(private readonly accountService: AccountService) {}

    @Post('create-subaccount')
    async createSubAccount(@Body() dto: CreateAccountDto) {
        return this.accountService.createSubAccount(dto.companyUrn);
    }
}
