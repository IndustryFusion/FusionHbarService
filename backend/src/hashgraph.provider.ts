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

export const HederaClientProvider = {
  provide: 'HEDERA_CLIENT',
  useFactory: () => {
    const client = Client.forTestnet();
    console.log('ENV CHECK:', HEDERA_ACCOUNT_ID, HEDERA_PRIVATE_KEY);
    if (!HEDERA_ACCOUNT_ID || !HEDERA_PRIVATE_KEY) {
      throw new Error('HEDERA_ACCOUNT_ID or HEDERA_PRIVATE_KEY is not defined in the environment variables.');
    }
    client.setOperator(
      AccountId.fromString(HEDERA_ACCOUNT_ID),
      PrivateKey.fromStringECDSA(HEDERA_PRIVATE_KEY),
    );
    return client;
  },
};