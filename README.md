<h1> DocTalker Web Application</h1>
<br>
<h2> How to use it guide :</h2>
<hr>
<h4> -- upload/upload ---> to upload a file (.pdf for now) to AWS s3 and retrieve its location and save it to mongo db</h4>
<h2> Here u have to only pass the file (like form Postman -- the key must be file) -- or form a form field (field name must be: 'file')</h2>
<br>
<h4> -- upload/process ---> to extract the text from the doc (from AWS s3) process it and make them chunks then get their embeddings and save it pinecone db and get vectorIndex of it to save it in mongo db</h4>
<h2> Here u have to only pass the file's id </h2>
<br>
<h4> -- query/query-process ---> extract the query from the user and get its embedding to perform a similarity search according to the embedded chunks and give the topk2 to openai with the query and receive the response </h4>
<h2> Here u have to only pass the file's id </h2>
<br>
