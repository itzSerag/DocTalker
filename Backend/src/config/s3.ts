import { S3Client } from '@aws-sdk/client-s3';

let clientInstance: S3Client | null = null;

export const getS3Client = (): S3Client => {
    if (!clientInstance) {
        clientInstance = new S3Client({
            region: (process.env.AWS_BUCKET_REGION || 'us-east-1').trim(),
            credentials: {
                accessKeyId: (process.env.AWS_ACCESS_KEY_ID || '').trim(),
                secretAccessKey: (process.env.AWS_SECRET_ACCESS_KEY || '').trim(),
            },
        });
    }
    return clientInstance;
};

// Export dynamic proxy to prevent early uninitialized evaluation
export const s3 = new Proxy({} as S3Client, {
    get(_target, prop) {
        const client = getS3Client();
        const value = (client as any)[prop];
        return typeof value === 'function' ? value.bind(client) : value;
    },
});

export default s3;
