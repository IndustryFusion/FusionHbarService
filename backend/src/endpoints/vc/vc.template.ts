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

export function generateVcDocument(holderDid: string, twinUrn: string, location: string, status: string, subAccountId: string): Record<string, any> {
  const vcId = twinUrn.split(":")[2]; // Or use your own namespace/format

  const issuanceDate = new Date().toISOString();

  return {
    vcId: "urn:vc:product:" + vcId,
    productUrn: twinUrn,
    timestamp: issuanceDate,
    vc: {
      '@context': ['https://www.w3.org/2018/credentials/v1'],
      id: "urn:vc:product:" + vcId,
      type: 'VerifiableCredential',
      issuer: 'did:hedera:0.0.999', // replace with your platform DID
      issuanceDate,
      credentialSubject: {
        id: twinUrn,
        status: status,
        location: location,
        owner: holderDid,
        ownerHederaAccountId: subAccountId, // Assuming holderDid is the Hedera account ID
      }
    }
  };
}


export function generateRevokeVcDocument(vcId: string, twinUrn: string, revocationReason: string): Record<string, any> {
  return {
    vcId: vcId,
    productUrn: twinUrn,
    revokedAt: new Date().toISOString(),
    type: 'VCRevocation',
    reason: revocationReason,
    revokedBy: 'did:hedera:0.0.999', // platform or issuer DID
  };
}