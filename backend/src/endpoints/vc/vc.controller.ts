import { Body, Controller, HttpException, HttpStatus, Post } from '@nestjs/common';
import { VcService } from './vc.service';
import { IssueVcDto } from './dto/issue-vc.dto';
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CreateTopicDto } from './dto/create-topic.dto';
import { IssueVcResponseDto } from './dto/issue-vc.response';
import { CreateTopicResponseDto } from './dto/create-topic.response';
import { IssueVcBatchDto } from './dto/issue-vc-batch.dto';
import { IssueVcBatchResponseDto } from './dto/issue-vc-batch.response';

@Controller('vc')
export class VcController {
    constructor(private readonly vcService: VcService) { }

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
    async issueVcBatch(@Body() body: IssueVcBatchDto): Promise<IssueVcBatchResponseDto> {
        const { holderDid, privateKey, subAccountId, twins, location } = body;

        if (!holderDid || !privateKey || !subAccountId || !Array.isArray(twins) || twins.length === 0) {
            throw new HttpException('Missing required fields or empty twins array', HttpStatus.BAD_REQUEST);
        }

        const results: Array<{ status: "success" | "error"; message?: string } & Record<string, any>> = [];

        for (const twin of twins) {
            try {
                const result = await this.vcService.issueVc(
                    holderDid,
                    twin.twinUrn,
                    location || 'Global', // default location
                    twin.status || 'Pending',
                    privateKey,
                    subAccountId,
                );
                results.push({ status: "success", ...result });
            } catch (err) {
                results.push({            
                    status: "error",
                    message: twin.twinUrn ? `Failed to issue VC for ${twin.twinUrn}: ${err.message}` : `Failed to issue VC: ${err.message}`,
                });
            }
        }

        if (results.length === 0) {
            throw new HttpException('No valid twins provided for VC issuance', HttpStatus.BAD_REQUEST);
        }
        if (results.every(result => result.status === "error")) {
            throw new HttpException('All VC issuances failed', HttpStatus.INTERNAL_SERVER_ERROR);
        }
        if (results.every(result => result.status === "success")) {
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
}
