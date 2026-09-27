import { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory, SafetySetting } from '@google/generative-ai';
import { processImages } from '../utils/processImages';

const safetySettings: SafetySetting[] = [
    {
        category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
        threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
    },
    {
        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
    },
    {
        category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
        threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
    },
    {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
    },
];

const getGenAI = (): GoogleGenerativeAI => {
    const apiKey = process.env.GEMINI_API_KEY || '';
    return new GoogleGenerativeAI(apiKey);
};

// gemini-3.8-flash handles pure text and multimodal images seamlessly
const DEFAULT_MODEL = 'gemini-3.8-flash';

export const textOnly = async (prompt: string): Promise<string> => {
    try {
        const genAI = getGenAI();
        const primaryModel = process.env.GEMINI_MODEL || DEFAULT_MODEL;
        try {
            const model = genAI.getGenerativeModel({
                model: primaryModel,
                safetySettings,
            });
            const result = await model.generateContent(prompt);
            const response = await result.response;
            return response.text();
        } catch (innerErr: any) {
            // Fallback to gemini-3.5-flash-lite if primary is rate-limited or unavailable
            if (primaryModel !== 'gemini-3.5-flash-lite') {
                const fallbackModel = genAI.getGenerativeModel({
                    model: 'gemini-3.5-flash-lite',
                    safetySettings,
                });
                const result = await fallbackModel.generateContent(prompt);
                const response = await result.response;
                return response.text();
            }
            throw innerErr;
        }
    } catch (error: any) {
        console.error('Gemini textOnly error:', error.message);
        throw new Error(`Gemini error: ${error.message}`);
    }
};

export const textAndImage = async (
    images: string[],
    prompt: string = 'Please describe and transcribe the content of this image thoroughly.'
): Promise<string> => {
    try {
        const genAI = getGenAI();
        const model = genAI.getGenerativeModel({
            model: process.env.GEMINI_VISION_MODEL || DEFAULT_MODEL,
            safetySettings,
        });

        const imageParts = await processImages(images);

        if (imageParts.length === 0) {
            throw new Error('No valid images could be processed');
        }

        const contentParts: any[] = [prompt, ...imageParts];
        const result = await model.generateContent(contentParts);
        const response = await result.response;
        return response.text();
    } catch (error: any) {
        console.error('Gemini textAndImage error:', error.message);
        throw new Error(`Gemini error: ${error.message}`);
    }
};

export const textStream = async (prompt: string): Promise<AsyncIterable<any>> => {
    try {
        const genAI = getGenAI();
        const primaryModel = process.env.GEMINI_MODEL || DEFAULT_MODEL;
        try {
            const model = genAI.getGenerativeModel({
                model: primaryModel,
                safetySettings,
            });
            const result = await model.generateContentStream(prompt);
            return result.stream;
        } catch (innerErr: any) {
            if (primaryModel !== 'gemini-3.5-flash-lite') {
                const fallbackModel = genAI.getGenerativeModel({
                    model: 'gemini-3.5-flash-lite',
                    safetySettings,
                });
                const result = await fallbackModel.generateContentStream(prompt);
                return result.stream;
            }
            throw innerErr;
        }
    } catch (error: any) {
        console.error('Gemini textStream error:', error.message);
        throw new Error(`Gemini error: ${error.message}`);
    }
};

export default { textOnly, textAndImage, textStream };
