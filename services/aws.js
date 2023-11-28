const AWS = require("aws-sdk");
const fs = require("fs");

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_ID,
  secretAccessKey: process.env.AWS_ACCESS_KEY,
  region: 'us-east-1',
});

export const s3Upload = async (bucket, file) => {
  const params = {
    Bucket: bucket,
    Key: file.name,
    Body: fs.createReadStream(file.path),
  };

  return await s3.upload(params).promise();
};
