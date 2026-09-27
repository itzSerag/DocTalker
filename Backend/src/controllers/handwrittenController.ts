import { Request, Response, NextFunction } from 'express';
import slugify from 'slugify';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { uploadFile } from '../services/aws';
import { generateImagesFromPdfBuffer } from '../utils/pdfToImages';
import DocumentModel from '../models/Document';
import Chat from '../models/Chat';
import AppError from '../utils/appError';
import catchAsync from '../utils/catchAsync';
import logger from '../utils/logger';

const getGeminiModel = () => {
    const apiKey = (process.env.GEMINI_API_KEY || '').trim();
    const genAI = new GoogleGenerativeAI(apiKey);
    const modelName = process.env.GEMINI_MODEL || 'gemini-3.8-flash';
    return genAI.getGenerativeModel({ model: modelName });
};

export const uploadHandwrittenPDF = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const file = req.file;
    const currUser = req.user;

    if (!currUser) {
        return next(new AppError('User not authenticated', 401));
    }

    if (!file || !file.buffer || !file.originalname) {
        return next(new AppError('Invalid or missing PDF upload', 400));
    }

    const timestamp = Date.now();
    const folderName = `handwritten_${slugify(file.originalname, { lower: true, strict: true })}_${timestamp}`;
    const userFolder = `${currUser._id}/${folderName}/`;
    const imageFolderWithinPdf = `${userFolder}images/`;

    // 1. Upload original PDF to S3
    const dataLocation = await uploadFile(
        file.originalname,
        file.buffer,
        file.mimetype || 'application/pdf',
        userFolder
    );

    // 2. Convert PDF pages to PNG buffers directly in memory
    let arrayImagesBody: Buffer[] = [];
    try {
        arrayImagesBody = await generateImagesFromPdfBuffer(file.buffer);
    } catch (err: any) {
        logger.warn(`Could not render PDF pages to images: ${err.message}`);
    }

    const model = getGeminiModel();
    const filesList: any[] = [];

    // Store the primary PDF reference
    filesList.push({
        FileName: file.originalname,
        FileKey: dataLocation.Key,
        FileURL: dataLocation.Location,
        Chunks: [],
        isProcessed: false,
    });

    // 3. Process each page image with Gemini OCR
    for (let i = 0; i < arrayImagesBody.length; i++) {
        const pageImage = arrayImagesBody[i];
        const pageFileName = `${file.originalname}_page_${i + 1}.png`;
        const uploadedImage = await uploadFile(pageFileName, pageImage, 'image/png', imageFolderWithinPdf);

        let ocrText = '';
        try {
            const prompt =
                'Please transcribe all handwritten and printed text in this document page accurately. Preserve equations, tables, lists, and numbers.';
            const result = await model.generateContent([
                {
                    inlineData: {
                        mimeType: 'image/png',
                        data: pageImage.toString('base64'),
                    },
                },
                { text: prompt },
            ]);
            ocrText = result.response.text();
        } catch (ocrErr: any) {
            logger.warn(`OCR failed for page ${i + 1}: ${ocrErr.message}`);
        }

        filesList.push({
            FileName: pageFileName,
            FileKey: uploadedImage.Key,
            FileURL: uploadedImage.Location,
            Chunks: ocrText
                ? [
                      {
                          rawText: ocrText,
                          pageNumber: i + 1,
                          fileName: pageFileName,
                          embeddings: [],
                      },
                  ]
                : [],
            isProcessed: Boolean(ocrText),
        });
    }

    const documentDoc = new DocumentModel({
        FileName: folderName,
        Files: filesList,
        isProcessed: false,
    });

    await documentDoc.save();

    const chat = new Chat({
        documentId: documentDoc._id,
        chatName: folderName,
    });

    await chat.save();

    currUser.uploadRequest += Math.max(1, arrayImagesBody.length);
    currUser.chats.push(chat._id as any);
    await currUser.save();

    return res.status(200).json({
        status: 'success',
        message: 'Handwritten PDF uploaded and processed successfully',
        chatId: chat._id,
        documentId: documentDoc._id,
    });
});

export const uploadHandwrittenPic = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const file = req.file;
    const currUser = req.user;

    if (!currUser) {
        return next(new AppError('User not authenticated', 401));
    }

    if (!file || !file.buffer || !file.originalname) {
        return next(new AppError('Please provide a handwritten image file', 400));
    }

    const timestamp = Date.now();
    const baseName = slugify(file.originalname.replace(/\.[^/.]+$/, ''), { lower: true, strict: true }) || 'note';
    const folderName = `handwritten_pic_${baseName}_${timestamp}`;
    const userFolder = `${currUser._id}/${folderName}/`;

    // 1. Upload image to S3
    const uploadResult = await uploadFile(file.originalname, file.buffer, file.mimetype || 'image/jpeg', userFolder);

    // 2. Perform OCR with Gemini Vision
    const model = getGeminiModel();
    let ocrText: string;
    try {
        const prompt =
            'Please transcribe all handwritten and printed text in this note/image accurately. Preserve layout, bullet points, headers, and formulas.';
        const result = await model.generateContent([
            {
                inlineData: {
                    mimeType: file.mimetype || 'image/jpeg',
                    data: file.buffer.toString('base64'),
                },
            },
            { text: prompt },
        ]);
        ocrText = result.response.text();
    } catch (ocrErr: any) {
        logger.error(`OCR processing failed for ${file.originalname}: ${ocrErr.message}`);
        return next(new AppError(`Handwritten OCR failed: ${ocrErr.message}`, 500));
    }

    // 3. Create Document and Chat in database
    const documentDoc = new DocumentModel({
        FileName: file.originalname,
        Files: [
            {
                FileName: file.originalname,
                FileKey: uploadResult.Key,
                FileURL: uploadResult.Location,
                Chunks: [
                    {
                        rawText: ocrText,
                        pageNumber: 1,
                        fileName: file.originalname,
                        embeddings: [],
                    },
                ],
                isProcessed: false,
            },
        ],
        isProcessed: false,
    });

    await documentDoc.save();

    const chat = new Chat({
        documentId: documentDoc._id,
        chatName: `${baseName} (Handwritten Note)`,
    });

    await chat.save();

    currUser.uploadRequest += 1;
    currUser.chats.push(chat._id as any);
    await currUser.save();

    return res.status(200).json({
        status: 'success',
        message: 'Handwritten note processed and indexed successfully',
        chatId: chat._id,
        documentId: documentDoc._id,
        extractedText: ocrText,
    });
});

export default { uploadHandwrittenPDF, uploadHandwrittenPic };
