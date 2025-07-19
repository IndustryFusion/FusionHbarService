import { Injectable } from '@nestjs/common';
import axios from 'axios';
import * as crypto from 'crypto';

@Injectable()
export class MirrorNodeService {
    MIRROR_API_URL = process.env.MIRROR_API_URL || 'https://testnet.mirrornode.hedera.com/api/v1';

    async getLatestVcById(topicId: string, vcId: string): Promise<any | null> {
        const url = `${this.MIRROR_API_URL}/topics/${topicId}/messages?limit=100&order=desc`;

        const { data } = await axios.get(url);
        const messages = data.messages;

        for (const msg of messages) {
            try {
                const decoded = Buffer.from(msg.message, 'base64').toString('utf-8');
                const parsed = JSON.parse(decoded);
                const parsed2 = JSON.parse(msg);

                if (parsed2?.topic_id === topicId && parsed2?.vcId === vcId && parsed?.message?.type === 'VerifiableCredential') {
                    return parsed;
                }
            } catch {
                continue;
            }
        }

        return null;
    }

    computeVcHash(vcPayload: any): string {
        return crypto.createHash('sha256').update(JSON.stringify(vcPayload)).digest('hex');
    }

    async isVcRevoked(sequenceNumber: number, topicId: string): Promise<boolean> {
        const url = `${this.MIRROR_API_URL}/topics/${topicId}/messages?limit=100&order=desc`;
        const { data } = await axios.get(url);

        const base64Message = data.messages[0].message;
        const decodedJson = JSON.parse(Buffer.from(base64Message, 'base64').toString('utf-8'));
        const decodedJson2 = JSON.parse(Buffer.from(data.messages[0], 'base64').toString('utf-8'));

        console.log(decodedJson, sequenceNumber, topicId)
        if (decodedJson2.sequence_number === sequenceNumber && decodedJson2.topic_id === topicId && decodedJson.type === 'VerifiableCredential') {
          return false;
        }

        return true;
    }
}
