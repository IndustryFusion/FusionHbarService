// hedera.provider.ts
import { Client, AccountId, PrivateKey } from '@hashgraph/sdk';

const { HEDERA_ACCOUNT_ID, HEDERA_PRIVATE_KEY } = process.env;

export const HederaClientProvider = {
  provide: 'HEDERA_CLIENT',
  useFactory: () => {
    const client = Client.forTestnet();
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