const { Pinecone } = require('@pinecone-database/pinecone');
const { getCompletion } = require('../services/openAi');
const { getEmbeddings } = require('../services/huggingface');
const { connectDB } = require('../config/database');
const DocumentModel = require('../models/Document');




// pinecone config
// TODO : ADD THE PINECONE CONFIG TO CONFIGs/PINECONE.JS
async function initialize() {
    const pinecone = new Pinecone({
        environment: process.env.PDB_ENV,
        apiKey: process.env.PDB_KEY,
    })
    return pinecone;
}

// const pinecone = await initialize();

exports.handler = async (req, res) => {
  // 1. check for POST call
  const { query, id } = req.body;

  // 2. connect to mongodb
  await connectDB();

  // 3. query the file by id
  const myFile = await MyFileModel.findById(id);

  if (!myFile) {
    return res.status(400).send({ message: 'invalid file id' });
  }

  // 4. get embeddings for the query
  const questionEmb = await getEmbeddings(query);

  // 5. initialize pinecone
  const pinecone = await initialize();

  // 6. connect to index
  const index = pinecone.Index(myFile.vectorIndex);

  // 7. query the pinecone db
  const queryRequest = {
    vector: questionEmb,
    topK: 5,
    includeValues: true,
    includeMetadata: true,
  };

  let result = await index.query({ queryRequest });

  // 8. get the metadata from the results
  let contexts = result['matches'].map((item) => item['metadata'].text);

  contexts = contexts.join('\n\n---\n\n');

  console.log('--contexts--', contexts);

  // 9. build the prompt
  const languageResponse = 'English'; // for now
  const promptStart = `Answer the question based on the context below with ${languageResponse}:\n\n`;
  const promptEnd = `\n\nQuestion: ${query} \n\nAnswer:`;

  const prompt = `${promptStart} ${contexts} ${promptEnd}`;

  console.log('--prompt--', prompt);

  // 10. get the completion from openai
  let response = await getCompletion(prompt);

  console.log('--completion--', response);

  // 11. return the response
  res.status(200).json({ response });
};
