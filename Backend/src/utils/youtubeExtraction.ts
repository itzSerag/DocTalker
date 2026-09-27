import { spawn } from 'child_process';
import AppError from './appError';
import { textOnly } from '../services/gemini';
import logger from './logger';

export const extractVideoId = (url: string): string => {
    const patterns = [
        /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/i,
        /^[a-zA-Z0-9_-]{11}$/,
    ];

    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match && match[1]) return match[1];
        if (match && match[0] && match[0].length === 11) return match[0];
    }

    throw new AppError('Invalid YouTube URL or video ID', 400);
};

const fetchViaPythonApi = (videoId: string): Promise<Array<{ start: number; duration: number; text: string }>> => {
    return new Promise((resolve, reject) => {
        const pythonScript = `
import sys, json
from youtube_transcript_api import YouTubeTranscriptApi
try:
    res = YouTubeTranscriptApi().fetch('${videoId}')
    output = [{'start': float(item.start), 'duration': float(item.duration), 'text': item.text} for item in res]
    sys.stdout.buffer.write(json.dumps(output).encode('utf-8'))
except Exception as e:
    sys.stderr.buffer.write(str(e).encode('utf-8'))
    sys.exit(1)
`;
        const py = spawn('python', ['-c', pythonScript]);
        let stdoutData = Buffer.alloc(0);
        let stderrData = Buffer.alloc(0);

        py.stdout.on('data', (chunk) => {
            stdoutData = Buffer.concat([stdoutData, chunk]);
        });

        py.stderr.on('data', (chunk) => {
            stderrData = Buffer.concat([stderrData, chunk]);
        });

        py.on('close', (code) => {
            if (code === 0) {
                try {
                    const parsed = JSON.parse(stdoutData.toString('utf-8'));
                    resolve(parsed);
                } catch (e: any) {
                    reject(new Error(`Failed to parse transcript output: ${e.message}`));
                }
            } else {
                const errMessage = stderrData.toString('utf-8').trim() || `Python process exited with code ${code}`;
                reject(new Error(errMessage));
            }
        });

        py.on('error', (err) => {
            reject(err);
        });
    });
};

export const extractTranscript = async (url: string): Promise<string> => {
    const videoId = extractVideoId(url);

    // 1. Primary: Extract via YouTube Transcript API
    try {
        const items = await fetchViaPythonApi(videoId);
        if (items && items.length > 0) {
            const formatted = items
                .map((item) => {
                    const seconds = Math.max(0, Math.floor(item.start));
                    const timestamp = `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
                    return `[${timestamp}] ${item.text}`;
                })
                .join('\n');
            return formatted;
        }
    } catch (err: any) {
        logger.warn(`Primary transcript extraction failed for video ${videoId}: ${err.message}. Trying AI fallback.`);
    }

    // 2. Secondary: Fallback to Gemini transcription/summary
    try {
        const fallbackPrompt = `You are an AI research assistant. Please provide a detailed chronological breakdown, key discussions, transcript notes, and timestamps for the YouTube video at https://www.youtube.com/watch?v=${videoId}. Format each timestamp segment like [MM:SS] followed by what is covered.`;
        const aiTranscription = await textOnly(fallbackPrompt);
        if (aiTranscription && aiTranscription.trim().length > 0) {
            return aiTranscription.trim();
        }
    } catch (fallbackErr: any) {
        logger.error(`AI transcription fallback also failed: ${fallbackErr.message}`);
    }

    throw new AppError(
        'Could not retrieve transcripts for this YouTube video. Captions may be disabled on this video.',
        404
    );
};

export default { extractTranscript, extractVideoId };
