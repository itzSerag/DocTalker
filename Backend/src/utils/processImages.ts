import axios from 'axios';
import mime from 'mime-types';
import { getFileBuffer } from '../services/aws';
import logger from './logger';

export interface GenerativePart {
    inlineData: {
        data: string;
        mimeType: string;
    };
}

export const urlToGenerativePart = async (url: string): Promise<GenerativePart | null> => {
    try {
        let buffer: Buffer;
        let detectedMime = 'image/png';

        // Check if this is an S3 URL or S3 key
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            buffer = await getFileBuffer(url);
            detectedMime = mime.lookup(url) || 'image/png';
        } else if (url.includes('.amazonaws.com')) {
            try {
                const parsedUrl = new URL(url);
                const key = decodeURIComponent(parsedUrl.pathname.replace(/^\/+/, ''));
                buffer = await getFileBuffer(key);
                detectedMime = mime.lookup(key) || 'image/png';
            } catch {
                const response = await axios.get(url, {
                    responseType: 'arraybuffer',
                    timeout: 15000,
                });
                buffer = Buffer.from(response.data);
                const rawHeader = response.headers['content-type'];
                detectedMime = typeof rawHeader === 'string' ? rawHeader : mime.lookup(url) || 'image/png';
            }
        } else {
            const response = await axios.get(url, {
                responseType: 'arraybuffer',
                timeout: 15000,
            });
            buffer = Buffer.from(response.data);
            const rawHeader = response.headers['content-type'];
            detectedMime = typeof rawHeader === 'string' ? rawHeader : mime.lookup(url) || 'image/png';
        }

        const base64Data = buffer.toString('base64');

        return {
            inlineData: {
                data: base64Data,
                mimeType: detectedMime.startsWith('image/') ? detectedMime : 'image/png',
            },
        };
    } catch (error: any) {
        logger.error(`processImages | Error loading image from ${url}: ${error.message}`);
        return null;
    }
};

export const processImages = async (images: string[]): Promise<GenerativePart[]> => {
    try {
        const parts = await Promise.all(images.map((img) => urlToGenerativePart(img)));
        return parts.filter((part): part is GenerativePart => part !== null);
    } catch (error: any) {
        logger.error(`processImages | Error: ${error.message}`);
        return [];
    }
};

export default { processImages, urlToGenerativePart };
