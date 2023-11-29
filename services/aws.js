const { S3, PutObjectCommand } = require("@aws-sdk/client-s3");
const { Readable } = require("stream");
const fs = require("fs");

const s3 = new S3({
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_ID,
    secretAccessKey: process.env.AWS_ACCESS_KEY,
  },
  region: 'us-east-1',
});

exports.s3Upload = async (bucket, file) => {
  const stream = fs.createReadStream(file.path);

  const params = {
    Bucket: bucket,
    Key: file.name,
    Body: Readable.from(stream),
  };

  const uploadCommand = new PutObjectCommand(params);

  try {
    const response = await s3.send(uploadCommand);
    console.log("File uploaded successfully:", response);
    return response;
  } catch (error) {
    console.error("Error uploading file:", error);
    throw error;
  } finally {
    // Close the stream after upload
    stream.close();
  }
};





// v2 aws

// const AWS = require("aws-sdk");
// const fs = require("fs");

// const s3 = new AWS.S3({
//   accessKeyId: process.env.AWS_ACCESS_ID,
//   secretAccessKey: process.env.AWS_ACCESS_KEY,
//   region: 'us-east-1',
// });

// exports.s3Upload = async (bucket, file) => {
//   const params = {
//     Bucket: bucket,
//     Key: file.name,
//     Body: fs.createReadStream(file.path),
//   };

//   return await s3.upload(params).promise();
// };