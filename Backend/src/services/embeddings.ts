import { OpenAI } from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import logger from '../utils/logger';

let openaiClient: OpenAI | null = null;
let geminiClient: GoogleGenerativeAI | null = null;

const getOpenAIClient = (): OpenAI | null => {
    const apiKey = (process.env.OPENAI_API_KEY || '').trim();
    if (!apiKey) return null;
    if (!openaiClient) {
        openaiClient = new OpenAI({ apiKey });
    }
    return openaiClient;
};

const getGeminiClient = (): GoogleGenerativeAI | null => {
    const apiKey = (process.env.GEMINI_API_KEY || '').trim();
    if (!apiKey) return null;
    if (!geminiClient) {
        geminiClient = new GoogleGenerativeAI(apiKey);
    }
    return geminiClient;
};

/**
 * Generates vector embeddings for a single text or batch of texts.
 * Uses OpenAI text-embedding-3-small as primary provider, with Gemini as fallback.
 */
export const getEmbeddings = async (content: string | string[]): Promise<number[] | number[][]> => {
    const isSingle = typeof content === 'string';
    const texts = isSingle ? [content as string] : (content as string[]);

    // Clean inputs: ensure no empty strings (which fail embedding APIs)
    const sanitizedTexts = texts.map((t) => (t && t.trim().length > 0 ? t.trim() : ' '));

    // 1. Try OpenAI text-embedding-3-small
    const openai = getOpenAIClient();
    if (openai) {
        try {
            const response = await openai.embeddings.create({
                model: 'text-embedding-3-small',
                input: sanitizedTexts,
            });

            const vectors = response.data.map((item) => item.embedding);
            return isSingle ? vectors[0] : vectors;
        } catch (err: any) {
            logger.warn(`OpenAI embedding failed: ${err.message}. Attempting Gemini fallback.`);
        }
    }

    // 2. Fallback to Google Gemini Embeddings (gemini-embedding-001)
    const gemini = getGeminiClient();
    if (gemini) {
        try {
            const model = gemini.getGenerativeModel({ model: 'gemini-embedding-001' });

            const vectors: number[][] = [];
            for (const text of sanitizedTexts) {
                const res = await model.embedContent(text);
                vectors.push(res.embedding.values);
            }
            return isSingle ? vectors[0] : vectors;
        } catch (err: any) {
            logger.error(`Gemini embedding fallback also failed: ${err.message}`);
            throw new Error(`Embedding service unavailable: ${err.message}`);
        }
    }

    throw new Error('No AI provider configured for embeddings (both OpenAI and Gemini keys missing).');
};

export default { getEmbeddings };
