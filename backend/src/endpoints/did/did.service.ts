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


import { Client, FileContentsQuery, FileCreateTransaction, FileId, FileUpdateTransaction, Hbar, PublicKey } from '@hashgraph/sdk';
import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { generateDidDocument } from './did.template';

@Injectable()
export class DidService {
    constructor(@Inject('HEDERA_CLIENT') private readonly client: Client) { }

    async createDid(urn: string, publicKey: PublicKey, subAccountId: string): Promise<Record<string, any>> {
        try {
            const did = urn.replace(/^urn:ifric:/, "did:hedera:");
            const didDocument = generateDidDocument(did, publicKey, subAccountId); // Assuming URN format is urn:did:hedera:<subAccountId
            const didDocumentJson = Buffer.from(JSON.stringify(didDocument));

            const createTx = new FileCreateTransaction()
                .setKeys([this.client.operatorPublicKey!])
                .setContents(didDocumentJson)
                .setMaxTransactionFee(new Hbar(2))

            const response = await createTx.execute(this.client);
            const receipt = await response.getReceipt(this.client);
            const fileId = receipt.fileId?.toString();
            if (!fileId) {
                throw new HttpException('Failed to retrieve fileId from receipt', HttpStatus.BAD_GATEWAY);
            }
            console.log(`✅ DID created for URN ${urn}: ${did}`);

            return {
                status: 201,
                did,
                fileId,
            };
        } catch (error) {
            console.error('❌ Failed to create DID document:', error);
            throw new HttpException(
                'Failed to create DID document: ' + error.message,
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }
      
    async revokeDid(fileId: string, revocationReason: string): Promise<Record<string, any>> {
        try {
            const fileContents = await new FileContentsQuery()
                .setFileId(FileId.fromString(fileId))
                .execute(this.client);

            const didDocument = JSON.parse(fileContents.toString());
            didDocument.revoked = true;
            didDocument.revokedAt = new Date().toISOString();
            didDocument.revocationReason = revocationReason;

            const updatedContents = Buffer.from(JSON.stringify(didDocument));

            await new FileUpdateTransaction()
                .setFileId(FileId.fromString(fileId))
                .setContents(updatedContents)
                .setMaxTransactionFee(new Hbar(2))
                .execute(this.client);

            return {
                status: 201,
                message: 'DID document revoked successfully',
                did: didDocument.id,
                fileId
            };
        } catch (error) {
            console.error('❌ Failed to revoke DID document:', error);
            throw new HttpException(
                'Failed to Revoke DID document: ' + error.message,
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    async isDidRevoked(fileId: string): Promise<boolean> {
        try {
            if (!fileId) {
                throw new HttpException('fileId is required', HttpStatus.BAD_REQUEST);
            }
            const fileIdObj = FileId.fromString(fileId);
            if (!fileIdObj) {
                throw new HttpException('Invalid fileId format', HttpStatus.BAD_REQUEST);
            }
            const contents = await new FileContentsQuery()
                .setFileId(fileIdObj)
                .execute(this.client);

            const doc = JSON.parse(Buffer.from(contents).toString());
            return doc.revoked === true;
        } catch (error) {
            console.error('❌ Failed to check DID status:', error);
            throw new HttpException(
                'Failed to check DID status: ' + error.message,
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }
}
