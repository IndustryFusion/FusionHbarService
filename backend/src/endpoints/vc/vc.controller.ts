import { Body, Controller, Post } from '@nestjs/common';
import { VcService } from './vc.service';

@Controller('vc')
export class VcController {
    constructor(private readonly vcService: VcService) { }

    @Post('issue')
    async issueVc(@Body() body: { holderDid: string; twinUrn: string }) {
        return this.vcService.issueVc(body.holderDid, body.twinUrn);
    }
}
