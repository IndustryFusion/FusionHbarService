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
import { Client, AccountCreateTransaction, PublicKey, Hbar, FileId } from '@hashgraph/sdk';
import { DidService } from '../did/did.service';
import { generateHederaPrivateKey } from '../certificates/certificate.service';

@Injectable()
export class AccountService {
    constructor(@Inject('HEDERA_CLIENT') private readonly client: Client, private readonly didService: DidService) {} // Injected Hedera client
    
    async createSubAccount(urn: string) {
        const keyPair = generateHederaPrivateKey()
        const publicKey = PublicKey.fromString(keyPair.publicKey);

        const transaction = new AccountCreateTransaction()
            .setKeyWithoutAlias(publicKey)
            .setInitialBalance(new Hbar(2)) // Set initial balance for account
            .setAccountMemo(`URN:${urn}`);

        const txResponse = await transaction.execute(this.client);
        const receipt = await txResponse.getReceipt(this.client);
        const newAccountId = receipt.accountId?.toString();

        if (!newAccountId) {
            throw new Error('Failed to create account: accountId is undefined');
        }
        const didResult = await this.didService.createDid(urn, publicKey);

        return {
            accountId: newAccountId,
            did: didResult.did,
            fileId: didResult.fileId,
            keyPair: keyPair
        };
    }
}
