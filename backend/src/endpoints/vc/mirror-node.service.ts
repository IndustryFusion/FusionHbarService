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
                const decoded = Buffer.from(msg, 'base64').toString('utf-8');
                const parsed = JSON.parse(decoded);

                if (parsed?.topic_id === topicId && parsed?.vcId === vcId && parsed?.message?.type === 'VerifiableCredential') {
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

        const base64Message = data.messages[0];
        const decodedJson = JSON.parse(Buffer.from(base64Message, 'base64').toString('utf-8'));

        console.log(decodedJson, sequenceNumber, topicId)
        if (decodedJson.sequence_number === sequenceNumber && decodedJson.topic_id === topicId && decodedJson.message.type === 'VerifiableCredential') {
          return false;
        }

        return true;
    }
}
