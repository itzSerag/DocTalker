const formidable = require('formidable-serverless');
const { connectDB } = require('../config/database');
const DocumentModel = require('../models/Document');
const slugify = require('slugify');
const {Pinecone} = require('@pinecone-database/pinecone');
const { s3Upload } = require('../services/aws');



// pinecone config
// TODO : ADD THE PINECONE CONFIG TO CONFIGs/PINECONE.JS
async function initialize() {
    const pinecone = new Pinecone({
        environment: process.env.PDB_ENV,
        apiKey: process.env.PDB_KEY,
    })
    return pinecone;
}

 const pinecone = initialize();



// Function to create a pinecone index  (helper function)
const createIndex = async (indexName) => {

  const indexes = pinecone.listIndexes()

  if (!indexes.includes(indexName)) {
    await pinecone.createIndex({
      createRequest: {
        name: indexName,
        dimension: 768, 
      },
    });
    console.log('index created');
  } else {
    throw new Error(`Index with name ${indexName} already exists`);
  }
};


///////////


// Uploading a file to S3 and creating a pinecone index
exports.handler = async (req, res) => {

  // 1. only allow POST methods
  if (req.method !== 'POST') {
    return res.status(400).send('method not supported');
  }

  try {
    // 2. connect to the mongodb db
    await connectDB();

    // 3. parse the incoming FormData
    let form = new formidable.IncomingForm();

    form.parse(req, async (error, fields, files) => {
      if (error) {
        console.error('Failed to parse form data:', error);
        return res.status(500).json({ error: 'Failed to parse form data' });
      }

      const file = files.file;

      // Check if the file object exists
      if (!file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      // Check if the necessary file properties are available
      if (!file.name || !file.path || !file.type) {
        return res.status(400).json({ error: 'Invalid file data' });
      }

      // 4. upload the file to s3
      let data = await s3Upload(process.env.S3_BUCKET, file);

      // 5. initialize pinecone // initialize pinecone name index
      const filenameWithoutSpecial = file.name.split('.')[0];
      const filenameSlug = slugify(filenameWithoutSpecial, {
        lower: true,
        strict: true,
      });

      await initialize(); 

      // 6. create a pinecone index
     createIndex(filenameSlug); // create index

      // 7. save file info to the mongodb db
      const myFile = new DocumentModel({
        fileName: file.name,
        fileUrl: data.Location,
        vectorIndex: filenameSlug,
      });
      await myFile.save();
      // await disconnectDB()

      // 8. return the success response
      return res.status(200).json({
        message: 'File uploaded to S3 and index created',
      });
    });
  } catch (e) {
    console.log('--error--', e);
    // await disconnectDB()
    return res.status(500).send({
      message: e.message,
    });
  }
};
