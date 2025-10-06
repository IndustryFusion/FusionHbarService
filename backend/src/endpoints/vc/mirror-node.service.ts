import { Injectable } from '@nestjs/common';
import axios from 'axios';
import * as crypto from 'crypto';

@Injectable()
export class MirrorNodeService {
    MIRROR_API_URL = process.env.MIRROR_API_URL || 'https://testnet.mirrornode.hedera.com/api/v1';
    bindingTopicId = process.env.CONTRACT_BINDING_VC_TOPIC_ID;

    async getLatestVcById(topicId: string, vcId: string): Promise<any | null> {
        const url = `${this.MIRROR_API_URL}/topics/${topicId}/messages?limit=1000&order=desc`;

        const { data } = await axios.get(url);
        const messages = data.messages;

        for (const msg of messages) {
            try {
                const decoded = Buffer.from(msg.message, 'base64').toString('utf-8');
                const parsed = JSON.parse(decoded);
                const parsed2 = msg;

                if (parsed2?.topic_id === topicId && parsed?.vcId === vcId && parsed?.vc?.type === 'VerifiableCredential') {
                    return parsed;
                }
            } catch {
                continue;
            }
        }

        return null;
    }

    async getVcByBindingUrn(bindingUrn: string): Promise<any | null> {
        const url = `${this.MIRROR_API_URL}/topics/${this.bindingTopicId}/messages?limit=1000&order=desc`;

        const { data } = await axios.get(url);
        const messages = data.messages;

        for (const msg of messages) {
            try {
                const decoded = Buffer.from(msg.message, 'base64').toString('utf-8');
                const parsed = JSON.parse(decoded);
                const parsed2 = msg;

                if (parsed2?.topic_id === this.bindingTopicId && parsed?.vc?.credentialSubject?.id === bindingUrn && parsed?.vc?.type === 'VerifiableCredential') {
                    return true;
                }
            } catch {
                continue;
            }
        }

        return false;
    }

    computeVcHash(vcPayload: any): string {
        return crypto.createHash('sha256').update(JSON.stringify(vcPayload)).digest('hex');
    }

    async isVcRevoked_old(sequenceNumber: number, topicId: string): Promise<boolean> {
        const url = `${this.MIRROR_API_URL}/topics/${topicId}/messages?limit=100&order=desc`;
        const { data } = await axios.get(url);

        const base64Message = data.messages[0].message;
        const decodedJson = JSON.parse(Buffer.from(base64Message, 'base64').toString('utf-8'));
        const decodedJson2 = data.messages[0];

        console.log(decodedJson, sequenceNumber, topicId)
        if (decodedJson2.sequence_number === sequenceNumber && decodedJson2.topic_id === topicId && decodedJson.vc.type === 'VerifiableCredential') {
          return false;
        }

        return true;
    }

    async isVcRevoked(sequenceNumber: number, topicId: string): Promise<boolean> {
        let url: string | null = `${this.MIRROR_API_URL}/topics/${topicId}/messages?limit=10&order=desc`;
    
        while (url) {
            const { data } = await axios.get(url);
    
            for (const msg of data.messages) {
                if (msg.sequence_number === sequenceNumber && msg.topic_id === topicId) {
                    const base64Message = msg.message;
                    const decodedJson = JSON.parse(Buffer.from(base64Message, 'base64').toString('utf-8'));
    
                    console.log(decodedJson, sequenceNumber, topicId);
    
                    if (decodedJson.vc?.type === 'VerifiableCredential') {
                        return false; // Not revoked
                    } else {
                        return true; // Revoked or unknown type
                    }
                }
            }
    
            const lowestSeq = data.messages[data.messages.length - 1]?.sequence_number;
            if (lowestSeq < sequenceNumber) break; // Stop early: target not in remaining pages
    
            url = data.links?.next ? `${this.MIRROR_API_URL}${data.links.next}` : null;
        }
    
        return true; // Not found → assume revoked
    }
}
