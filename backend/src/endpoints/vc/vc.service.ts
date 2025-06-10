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

import { Inject, Injectable } from '@nestjs/common';
import { Client, Hbar, PrivateKey, TopicCreateTransaction, TopicInfoQuery, TopicMessageSubmitTransaction } from '@hashgraph/sdk';
import { generateVcDocument } from './vc.template';

@Injectable()
export class VcService {
    private readonly issuerDid = process.env.PLATFORM_DID!;
    private readonly privateKey = process.env.HEDERA_PRIVATE_KEY!;
    private readonly topicId = process.env.VC_TOPIC_ID!; // HCS Topic ID

    constructor(@Inject('HEDERA_CLIENT') private readonly client: Client) { }

    async createNewTopic(client) {
        const transaction = new TopicCreateTransaction()
            .setTopicMemo(this.topicId) // Optional memo
            .setAdminKey(client.operatorPublicKey) // Optional admin key
            .setAutoRenewAccountId(client.operatorAccountId); // Auto-renew settings

        const response = await transaction.execute(client);
        const receipt = await response.getReceipt(client);
        if (!receipt.topicId) {
            throw new Error("Failed to create topic: topicId is undefined");
        }
        console.log("New Topic ID:", receipt?.topicId.toString());
        return receipt.topicId.toString();
    }

    async ensureTopicExists(topicId) {
        try {
            const query = new TopicInfoQuery().setTopicId(topicId);
            const info = await query.execute(this.client);
            console.log("Topic exists:", info);
            return topicId; // Return existing topic ID
        } catch (error) {
            if (error.status && error.status.toString() === "INVALID_TOPIC_ID") {
                console.log("Topic does not exist, creating a new one...");
                return this.createNewTopic(this.client);
            }
            throw error; // Handle other errors
        }
    }

    async issueVc(holderDid: string, twinUrn: string) {
        const issuanceDate = new Date().toISOString();

        const vcPayload = generateVcDocument(holderDid, twinUrn);
        const vcWithProof = {
            ...vcPayload,
            proof: {
                type: 'Ed25519Signature2020',
                created: issuanceDate,
                proofPurpose: 'assertionMethod',
                verificationMethod: `${this.issuerDid}#keys-1`
            },
        };

        const message = Buffer.from(JSON.stringify(vcWithProof));
        const topicCheck = await this.ensureTopicExists(this.topicId);
        if (!topicCheck) {
            throw new Error("Failed to ensure topic exists");
        }
        const submitTx = new TopicMessageSubmitTransaction()
            .setTopicId(this.topicId)
            .setMessage(message)
            .setMaxTransactionFee(new Hbar(2));

        const freezeTransaction = (await submitTx).freezeWith(this.client);
        const signedTransaction = freezeTransaction.sign(PrivateKey.fromStringECDSA(this.privateKey));
        const response = (await signedTransaction).execute(this.client);
        const receipt = await (await response).getReceipt(this.client);
        const sequenceNumber = receipt?.topicSequenceNumber?.toString();

        return {
            vcId: twinUrn,
            topicId: this.topicId,
            sequenceNumber,
            vc: vcWithProof,
        };
    }
}
