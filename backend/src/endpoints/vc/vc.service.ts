/**
* Copyright (c) 2025, Industry Fusion Foundation
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/

import { HttpException, HttpStatus, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { AccountInfoQuery, Client, Hbar, PrivateKey, TopicCreateTransaction, TopicInfoQuery, TopicMessageSubmitTransaction } from '@hashgraph/sdk';
import { generateRevokeVcDocument, generateVcDocument } from './vc.template';
import { MirrorNodeService } from './mirror-node.service';

@Injectable()
export class VcService {
    private readonly issuerDid = process.env.PLATFORM_DID!;
    private readonly privateKey = process.env.HEDERA_PRIVATE_KEY!;
    private readonly topicId = process.env.VC_TOPIC_ID!; // HCS Topic ID

    constructor(@Inject('HEDERA_CLIENT') private readonly client: Client, private readonly mirrorNodeService: MirrorNodeService) { }

    async createNewTopic(region: string): Promise<Record<string, any>> {
        try {
            const memo = `VCs for ${region.toUpperCase()} products`;

            const transaction = new TopicCreateTransaction()
                .setTopicMemo(memo)
                .setMaxTransactionFee(new Hbar(0.5));

            const txResponse = await transaction.execute(this.client);
            const receipt = await txResponse.getReceipt(this.client);
            const topicId = receipt.topicId?.toString();

            if (!topicId) {
                throw new HttpException('Failed to retrieve topic ID from receipt', HttpStatus.BAD_REQUEST);
            }

            return {
                status: 201,
                message: `New topic created for ${region.toUpperCase()} region`,
                region,
                topicId,
                memo,
            };
        } catch (error) {
            console.error(`❌ Failed to create topic for region ${region}:`, error);
            throw new HttpException(
                `Failed to create HCS topic: ${error.message || 'Unknown error'}`,
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }


    async issueVc(holderDid: string, twinUrn: string, location: string, status: string, privateKey: string, subAccountId: string): Promise<Record<string, any>> {
        try {
            const issuanceDate = new Date().toISOString();

            const vcPayload = generateVcDocument(holderDid, twinUrn, location, status, subAccountId);
            const vcWithProof = {
                ...vcPayload,
                proof: {
                    type: 'Ed25519Signature2020',
                    created: issuanceDate,
                    proofPurpose: 'assertionMethod',
                    verificationMethod: `${holderDid}#keys-1`
                }
            };

            const info = await new AccountInfoQuery().setAccountId(subAccountId).execute(this.client);
            const expectedPublicKey = info.key.toString();
            const key = PrivateKey.fromStringED25519(privateKey);
            const derivedPublicKey = key.publicKey.toString();
            console.log("Expected Public Key:", expectedPublicKey);
            console.log("Derived Public Key:", derivedPublicKey);
            
            if (expectedPublicKey !== derivedPublicKey) {
                throw new HttpException(
                    'Private key seems to be incorrect: expected public key does not match derived public key',
                    HttpStatus.BAD_REQUEST
                );
            }

            console.log("✅ Private key matches the expected public key");

            const message = Buffer.from(JSON.stringify(vcWithProof));
            
            const submitTx = new TopicMessageSubmitTransaction()
                .setTopicId(this.topicId)
                .setMessage(message)
                .setMaxTransactionFee(new Hbar(0.5));

            const freezeTransaction = (await submitTx).freezeWith(this.client);
            const signedTransaction = freezeTransaction.sign(key);
            const response = (await signedTransaction).execute(this.client);
            const receipt = await (await response).getReceipt(this.client);
            const sequenceNumber = receipt?.topicSequenceNumber?.toString();
            if (!sequenceNumber) {
                throw new HttpException(
                    'VC issued but topic sequence number is missing',
                    HttpStatus.BAD_REQUEST,
                );
            }

            return {
                status: 201,
                message: 'Verifiable Credential issued successfully',
                twinUrn: twinUrn,
                vcId: vcPayload.vcId,
                topicId: this.topicId,
                sequenceNumber,
                vc: vcWithProof
            };
        } catch (error) {
            console.error('❌ Failed to issue VC:', error);
            throw new HttpException(
                `Failed to issue VC: ${error.message || 'Unknown error'}`,
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }


    async revokeVc(twinUrn: string, vcId: string, revocationReason: string): Promise<Record<string, any>> {
        try {
            const latestVc = await this.mirrorNodeService.getLatestVcById(this.topicId, vcId);
            if (!latestVc) {
                throw new NotFoundException(`No VC found for vcId ${vcId}`);
            }
            const issuanceDate = new Date().toISOString();
            const vcHash = this.mirrorNodeService.computeVcHash(latestVc.vc);

            const vcPayload = generateRevokeVcDocument(vcId, twinUrn, revocationReason);
            const vcWithProof = {
                ...vcPayload,
                vcHash: vcHash,
                proof: {
                    type: 'Ed25519Signature2020',
                    created: issuanceDate,
                    proofPurpose: 'assertionMethod',
                    verificationMethod: `did:hedera:0.0.999#keys-1`
                }
            };

            const message = Buffer.from(JSON.stringify(vcWithProof));
            const submitTx = new TopicMessageSubmitTransaction()
                .setTopicId(this.topicId)
                .setMessage(message)
                .setMaxTransactionFee(new Hbar(0.5));

            const freezeTransaction = (await submitTx).freezeWith(this.client);
            const signedTransaction = freezeTransaction.sign(PrivateKey.fromStringED25519(this.privateKey));
            const response = (await signedTransaction).execute(this.client);
            const receipt = await (await response).getReceipt(this.client);
            const sequenceNumber = receipt?.topicSequenceNumber?.toString();
            if (!sequenceNumber) {
                throw new HttpException(
                    'VC revoked but topic sequence number is missing',
                    HttpStatus.BAD_REQUEST,
                );
            }

            return {
                status: 201,
                message: 'Verifiable Credential revoked successfully',
                twinUrn: twinUrn,
                vcId: vcPayload.vcId,
                topicId: this.topicId,
                sequenceNumber,
                vc: vcWithProof
            };
        } catch (error) {
            console.error('❌ Failed to revoke VC:', error);
            throw new HttpException(
                `Failed to revoke VC: ${error.message || 'Unknown error'}`,
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }
}
