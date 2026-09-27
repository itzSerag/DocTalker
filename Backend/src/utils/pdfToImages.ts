import { pdfToPng } from 'pdf-to-png-converter';
import { getFileBuffer } from '../services/aws';
import logger from './logger';

/**
 * Converts a PDF Buffer into an array of PNG page Buffers.
 */
export const generateImagesFromPdfBuffer = async (pdfBuffer: Buffer): Promise<Buffer[]> => {
    try {
        const pngPages = await pdfToPng(pdfBuffer, {
            viewportScale: 2.0,
        });

        return pngPages.map((page) => page.content).filter((buf): buf is Buffer => Buffer.isBuffer(buf));
    } catch (error: any) {
        logger.error(`Error generating images from PDF buffer: ${error.message}`);
        throw error;
    }
};

/**
 * Downloads a PDF using its S3 key (authenticated) or direct URL, and converts each page into PNG.
 */
export const generateImagesFromS3Doc = async (s3DocUrlOrKey: string): Promise<Buffer[]> => {
    try {
        let pdfBuffer: Buffer;
        if (!s3DocUrlOrKey.startsWith('http://') && !s3DocUrlOrKey.startsWith('https://')) {
            pdfBuffer = await getFileBuffer(s3DocUrlOrKey);
        } else {
            // Attempt to extract key from URL
            const url = new URL(s3DocUrlOrKey);
            const key = decodeURIComponent(url.pathname.replace(/^\/+/, ''));
            try {
                pdfBuffer = await getFileBuffer(key);
            } catch {
                const response = await fetch(s3DocUrlOrKey);
                pdfBuffer = Buffer.from(await response.arrayBuffer());
            }
        }

        return await generateImagesFromPdfBuffer(pdfBuffer);
    } catch (error: any) {
        logger.error(`Error generating images from S3 doc: ${error.message}`);
        throw error;
    }
};

export default { generateImagesFromPdfBuffer, generateImagesFromS3Doc };
