import { Request, Response, NextFunction } from 'express';
import DocumentModel from '../models/Document';
import Chat from '../models/Chat';
import { convertDocToChunks } from '../utils/extractDataFromDocs';
import { getEmbeddings } from '../services/embeddings';
import catchAsync from '../utils/catchAsync';
import AppError from '../utils/appError';
import logger from '../utils/logger';

export const handler = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { chatId } = req.body;

    if (!chatId) {
        return next(new AppError('chatId is required in request body', 400));
    }

    if (!req.user || !req.user.chats.some((userChatId) => userChatId.toString() === String(chatId))) {
        return next(new AppError('Chat not found or access denied', 404));
    }

    const chat = await Chat.findById(chatId);
    if (!chat) {
        return next(new AppError('Chat not found', 404));
    }

    const document = await DocumentModel.findById(chat.documentId);
    if (!document) {
        return next(new AppError('Document associated with this chat was not found', 404));
    }

    if (document.isProcessed) {
        return res.status(200).json({
            status: 'success',
            message: 'Document has already been processed',
            chatId: chat._id,
        });
    }

    // Process all files in the document
    for (const file of document.Files) {
        try {
            let readableChunks: { chunk: string; pageNumber: number | null; fileName: string }[] = [];

            // If file already has pre-extracted raw text (e.g., from OCR or YouTube)
            if (file.Chunks && file.Chunks.length > 0 && file.Chunks.some((c) => c.rawText?.trim())) {
                readableChunks = file.Chunks.filter((c) => c.rawText?.trim()).map((c) => ({
                    chunk: c.rawText,
                    pageNumber: c.pageNumber || null,
                    fileName: c.fileName || file.FileName,
                }));
            } else {
                const extracted = await convertDocToChunks(file.FileName, file.FileURL, file.FileKey);
                readableChunks = extracted
                    .filter((chunk) => chunk.chunk?.trim())
                    .map((c) => ({
                        chunk: c.chunk,
                        pageNumber: c.pageNumber || null,
                        fileName: c.fileName || file.FileName,
                    }));
            }

            if (readableChunks.length === 0) {
                logger.warn(`No readable chunks found for file: ${file.FileName}`);
                continue;
            }

            const vectors: any[] = [];
            for (let index = 0; index < readableChunks.length; index += 8) {
                const batch = readableChunks.slice(index, index + 8);
                const embeddings = await Promise.all(batch.map((item) => getEmbeddings(item.chunk)));
                batch.forEach((item, batchIndex) => {
                    const embedding = embeddings[batchIndex];
                    if (!Array.isArray(embedding) || embedding.length === 0 || Array.isArray(embedding[0])) {
                        throw new Error('Embedding service returned an invalid vector');
                    }
                    vectors.push({
                        rawText: item.chunk,
                        embeddings: embedding as number[],
                        pageNumber: item.pageNumber || null,
                        fileName: item.fileName,
                    });
                });
            }

            file.Chunks = vectors;
            file.isProcessed = true;
        } catch (error: any) {
            logger.error(`Error processing file ${file.FileName}: ${error.message}`);
            return next(new AppError(`Error processing file ${file.FileName}: ${error.message}`, 500));
        }
    }

    const totalChunks = document.Files.reduce((acc, f) => acc + (f.Chunks?.length || 0), 0);
    if (totalChunks === 0) {
        return next(new AppError('No readable text could be extracted from the files in this source.', 422));
    }

    document.isProcessed = true;
    await document.save();

    chat.isProcessed = true;
    chat.chatName = document.FileName;
    await chat.save();

    return res.status(200).json({
        status: 'success',
        message: 'Document processed and embeddings generated successfully',
        chatId: chat._id,
    });
});

export default { handler };
