const pdfParse = require('pdf-parse');
const DocumentModel = require('../models/Document');
const { connectDB } = require('../config/database');
const { getEmbeddings } = require('../services/huggingface');
const  {Pinecone} = require('@pinecone-database/pinecone');
const { RecursiveCharacterTextSplitter } = require('langchain/text_splitter')
const mammoth = require("mammoth"); // For handling .docx files
const fs = require("fs/promises");


// pinecone config
// TODO : ADD THE PINECONE CONFIG TO CONFIGs/PINECONE.JS



exports.handler = async (req, res) => {
  // 1. check for POST call
  if (req.method !== 'POST') {
    return res.status(400).json({ message: 'http method not allowed' });
  }

  try {
    // 2. connect to mongodb
    await connectDB();

    // 3. query the file by id
    const { id } = req.body;

    const myFile = await DocumentModel.findById(id);

    if (!myFile) {
      return res.status(400).json({ message: 'file not found' });
    }

    if (myFile.isProcessed) { // from the database
      return res.status(400).json({ message: 'file is already processed' });
    }

    // Initialize RecursiveCharacterTextSplitter
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 512,
      chunkOverlap: 30,
    });

    // 4. Read the document content based on file extension
    let documentContent;
    const myFileUrlString = myFile.fileUrl


    if (myFileUrlString.endsWith('.pdf')) {
      // For PDF files
      const pdfData = await fetch(myFile.fileUrl);
      const buffer = await pdfData.arrayBuffer();

      // extract text from pdf
      const pdfText = await pdfParse(buffer);

      // TODO : CHECK IF THE USER IS FREE OR NOT TO SPECIFIC PAGES NUMBER
      // for (let i = 0; i < numPages; i++) {
      //   let page = await pdfDoc.getPage(i + 1);  // important 

		// TODO : CHECK IF THE USER IS FREE OR NOT TO SPECIFIC PAGES NUMBER

      // TODO : REMOVE EXTRA SPACES
      //   pdfText += textContent.items.map(item => item.str).join(''); 
      // }

      documentContent = pdfText.text;
      console.log(documentContent);
      //

    } else if (myFile.fileUrl.endsWith('.docx')) {
      // For Word documents (.docx)
      const docxData = await fetch(myFile.fileUrl);
      const buffer = await docxData.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer: buffer });
      documentContent = result.value;
    } else if (myFile.fileUrl.endsWith('.txt')) {
      // For plain text files
      const txtData = await fetch(myFile.fileUrl);

      documentContent = await txtData.text();
    } else {
      // Unsupported file type 

	  // TODO : ADD MORE FILE TYPES
	  // TODO : ADD A FUNCTION TO EXTRACT TEXT FROM WEBSITES

      return res.status(400).json({ message: 'Unsupported file type' });
    }

    // Chunk the text using RecursiveCharacterTextSplitter
    const chunks = await splitter.splitText(documentContent);

    // 5. Get embeddings for each chunk
    let vectors = [];
    for (const chunk of chunks) {
      const embedding = await getEmbeddings(chunk);

      // 6. push to vector array
      vectors.push({
        id: `chunk${chunks.indexOf(chunk)}`,
        values: embedding,
        metadata: {
          chunkNum: chunks.indexOf(chunk) ,
          text: chunk,
        },
      });
    }

  
    // 7. initialize pinecone
    const pinecone = new Pinecone({
      environment: process.env.PDB_ENV,
      apiKey: process.env.PDB_KEY,
     }); // initialize pinecone

    // 8. connect to the index
    const index = pinecone.Index(myFile.vectorIndex);

    // 9. upsert to pinecone index
     console.log(vectors);

    await index.upsert(vectors);

    // 10. update mongodb with isProcessed to true
    myFile.isProcessed = true;
    await myFile.save();
    // await disconnectDB()

    // 11. return the response
    return res.status(200).json({ message: 'File processed successfully' });
  } catch (e) {
    console.log(e);
    // await disconnectDB()
    return res.status(500).json({ message: e.message });
  }
};
