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

import { PublicKey } from "@hashgraph/sdk";

export function generateDidDocument(did: string, publicKey: PublicKey) {
  return {
    '@context': 'https://www.w3.org/ns/did/v1',
    id: did,
    verificationMethod: [
      {
        id: `${did}#keys-1`,
        type: 'Ed25519VerificationKey2018',
        controller: did,
        publicKeyMultibase: publicKey,
      },
    ],
    authentication: [`${did}#keys-1`],
  };
}