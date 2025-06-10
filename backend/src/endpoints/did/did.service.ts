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

import { Client, FileCreateTransaction, Hbar, PublicKey } from '@hashgraph/sdk';
import { Inject, Injectable } from '@nestjs/common';
import { generateDidDocument } from './did.template';

@Injectable()
export class DidService {
    constructor(@Inject('HEDERA_CLIENT') private readonly client: Client) {}
    
    async createDid(urn: string, publicKey: PublicKey) {

        const did = urn;
        const didDocument = generateDidDocument(did, publicKey);
        const didDocumentJson = Buffer.from(JSON.stringify(didDocument));

        const createTx = new FileCreateTransaction()
            .setKeys([this.client.operatorPublicKey!])
            .setContents(didDocumentJson)
            .setMaxTransactionFee(new Hbar(2))
        
        const response = await createTx.execute(this.client);
        const receipt = await response.getReceipt(this.client);
        const fileId = receipt.fileId?.toString();
        console.log(`✅ DID created for URN ${urn}: ${did}`);

        return {
            urn,
            did,
            fileId,
        };
    }
}
