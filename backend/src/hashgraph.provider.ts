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

import { Client, AccountId, PrivateKey } from '@hashgraph/sdk';
import * as dotenv from 'dotenv';
dotenv.config(); // Ensure variables are loaded

const HEDERA_ACCOUNT_ID = process.env.HEDERA_ACCOUNT_ID;
const HEDERA_PRIVATE_KEY = process.env.HEDERA_PRIVATE_KEY;
const HEDERA_NETWORK = process.env.HEDERA_NETWORK;

export const HederaClientProvider = {
  provide: 'HEDERA_CLIENT',
  useFactory: () => {
    console.log('ENV CHECK:', HEDERA_ACCOUNT_ID, HEDERA_PRIVATE_KEY, HEDERA_NETWORK);
    if (!HEDERA_ACCOUNT_ID || !HEDERA_PRIVATE_KEY || !HEDERA_NETWORK) {
      throw new Error('HEDERA_ACCOUNT_ID, HEDERA_PRIVATE_KEY or HEDERA_NETWORK is not defined in the environment variables.');
    }

    let client: Client;

    if (HEDERA_NETWORK === 'mainnet') {
      client = Client.forMainnet();
    } else if (HEDERA_NETWORK === 'testnet') {
      client = Client.forTestnet();
    } else {
      throw new Error(`Unsupported HEDERA_NETWORK: ${HEDERA_NETWORK}`);
    }

    client.setOperator(
      AccountId.fromString(HEDERA_ACCOUNT_ID),
      PrivateKey.fromStringECDSA(HEDERA_PRIVATE_KEY),
    );
    return client;
  },
};