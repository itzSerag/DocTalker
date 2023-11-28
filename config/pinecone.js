const { Pinecone } = require("@pinecone-database/pinecone");

const pinecone = new Pinecone();
 
export const initialization = async () => {

    await pinecone({
        environment: process.env.PDB_ENV,
        apiKey: process.env.PDB_KEY,
    });
    console.log("Pinecone initialized");
   
};
