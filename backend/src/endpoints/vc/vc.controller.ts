import { Body, Controller, Get, HttpException, HttpStatus, Param, Post } from '@nestjs/common';
import { VcService } from './vc.service';
import { IssueVcDto } from './dto/issue-vc.dto';
import { ApiBody, ApiOkResponse, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { CreateTopicDto } from './dto/create-topic.dto';
import { IssueVcResponseDto } from './dto/issue-vc.response';
import { CreateTopicResponseDto } from './dto/create-topic.response';
import { IssueVcBatchDto } from './dto/issue-vc-batch.dto';
import { IssueVcBatchResponseDto } from './dto/issue-vc-batch.response';
import { RevokeVcDto } from './dto/revoke-vc.dto';
import { MirrorNodeService } from './mirror-node.service';
import pLimit from 'p-limit';

@Controller('vc')
export class VcController {
    constructor(private readonly vcService: VcService, private readonly mirrorNodeService: MirrorNodeService) { }

    @Post('issue')
    @ApiOperation({ summary: 'Issue a Verifiable Credential for a digital twin' })
    @ApiBody({ type: IssueVcDto })
    @ApiResponse({ status: 201, description: 'VC issued successfully', type: IssueVcResponseDto })
    @ApiResponse({ status: 400, description: 'Missing required fields' })
    async issueVc(@Body() body: IssueVcDto) {
        const { holderDid, twinUrn, privateKey, subAccountId } = body;
        if (!holderDid || !twinUrn || !privateKey || !subAccountId) {
            throw new HttpException(
                'holderDid, twinUrn, privateKey, and subAccountId are required fields',
                HttpStatus.BAD_REQUEST,
            );
        }
        return this.vcService.issueVc(body.holderDid, body.twinUrn, body.location, body.status, body.privateKey, body.subAccountId);
    }

    @Post('create-new-topic')
    @ApiOperation({ summary: 'Create a new HCS topic for a region' })
    @ApiBody({ type: CreateTopicDto })
    @ApiResponse({ status: 201, description: 'New topic created', type: CreateTopicResponseDto })
    async createNewTopic(@Body() body: CreateTopicDto): Promise<CreateTopicResponseDto> {
        const { region } = body;
        const result = await this.vcService.createNewTopic(region);
        return {
            status: result.status,
            message: result.message,
            region: result.region,
            topicId: result.topicId,
            memo: result.memo,
        } as CreateTopicResponseDto;
    }


    @Post('issue-batch')
    @ApiOperation({ summary: 'Issue multiple VCs for a batch of twins' })
    @ApiBody({ type: IssueVcBatchDto })
    @ApiResponse({ status: 201, description: 'Batch VC issuance completed', type: IssueVcBatchResponseDto })
    @ApiResponse({ status: 400, description: 'Invalid or missing fields' })
    @ApiResponse({ status: 207, description: 'Batch VC issuance completed with some errors' })
    @ApiResponse({ status: 500, description: 'All VC issuances failed' })
    async issueVcBatch(@Body() body: IssueVcBatchDto) {
        const { holderDid, privateKey, subAccountId, twins, location } = body;

        if (!holderDid || !privateKey || !subAccountId || twins.length === 0) {
            throw new HttpException('Missing required fields or empty twins array', HttpStatus.BAD_REQUEST);
        }

        const limit = pLimit(10); // Max 10 concurrent tasks, tune as per infra
        const tasks: Array<Promise<Record<string, any>>> = [];

        for (const twin of twins) {
            tasks.push(limit(async () => {
                try {
                    const result = await this.vcService.issueVc(
                        holderDid,
                        twin.twinUrn,
                        location || 'Global',
                        twin.status || 'Pending',
                        privateKey,
                        subAccountId,
                    );
                    return result;
                } catch (err) {
                    return {
                        status: "error",
                        message: twin.twinUrn
                            ? `Failed to issue VC for ${twin.twinUrn}: ${err.message}`
                            : `Failed to issue VC: ${err.message}`,
                    };
                }
            }));
        }

        const results = await Promise.all(tasks);

        if (results.length === 0) {
            throw new HttpException('No valid twins provided for VC issuance', HttpStatus.BAD_REQUEST);
        }
        if (results.every(result => Number(result.status) !== 201)) {
            throw new HttpException('All VC issuances failed', HttpStatus.INTERNAL_SERVER_ERROR);
        }
        if (results.every(result => Number(result.status) === 201)) {
            return {
                status: 201,
                message: 'Batch VC issuance completed',
                results,
            };
        }
        else {
            return {
                status: 207, // Partial success
                message: 'Batch VC issuance completed with some errors',
                results,
            };
        }
    }


    @Post('revoke-vc')
    @ApiOperation({ summary: 'Revoke a Verifiable Credential' })
    @ApiBody({ type: RevokeVcDto })
    @ApiResponse({ status: 201, description: 'VC revoked successfully' })
    @ApiResponse({ status: 400, description: 'Missing required fields' })
    async revokeVc(@Body() body: RevokeVcDto): Promise<Record<string, any>> {
        const { twinUrn, vcId, revocationReason } = body;
        if (!twinUrn || !vcId || !revocationReason) {
            throw new HttpException(
                'twinUrn, vcId, and revocationReason are required fields',
                HttpStatus.BAD_REQUEST,
            );
        }
        return this.vcService.revokeVc(twinUrn, vcId, revocationReason);
    }

    @Get('/:sequenceNumber/:topicId/status')
    @ApiParam({ name: 'sequenceNumber', type: String })
    @ApiParam({ name: 'topicId', type: String })
    @ApiOkResponse({ schema: { example: { revoked: true, topicId: "" } } })
    async getVcStatus(@Param('sequenceNumber') sequenceNumber: string, @Param('topicId') topicId: string): Promise<{ revoked: boolean }> {
        if (!sequenceNumber || !topicId) {
            throw new HttpException(
                'sequenceNumber and topicId are required parameters',
                HttpStatus.BAD_REQUEST,
            );
        }
        const revoked = await this.mirrorNodeService.isVcRevoked(Number(sequenceNumber), topicId);
        return { revoked };
    }

    @Get('get-on-chain-vc/:vcId/:topicId')
    @ApiParam({ name: 'vcId', type: String })
    @ApiParam({ name: 'topicId', type: String })
    async getOnChainCert(@Param('vcId') vcId: string, @Param('topicId') topicId: string): Promise<{ messages: [] }> {
        if (!vcId || !topicId) {
            throw new HttpException(
                'vcId and topicId are required parameters',
                HttpStatus.BAD_REQUEST,
            );
        }
        const messages = await this.mirrorNodeService.getLatestVcById(topicId, vcId);
        return { messages: messages };
    }

}
