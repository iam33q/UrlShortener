require('dotenv').config();
const express = require('express');
const cors = require('cors');
const url = require('url');
const bodyParser = require('body-parser');
const dns = require('dns');
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;
app.use(cors());
app.use(bodyParser.urlencoded({extended: false}));

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.post('/api/shorturl', async (req, res) => {
  let rawUrl = req.body.url;
  // if (rawUrl.search('https://') == -1 || rawUrl.search('http://') == -1){
  //   rawUrl = `https://${rawUrl}`;
  // }
  let urlObject;
  try {
    urlObject = new URL(rawUrl);
    console.log(urlObject);
    const gg = await dns.promises.resolve(urlObject.hostname);
  } 
  catch (e) {
    console.log(e);
    res.json({
      error: 'invalid url'
    })
  };
 console.log("something");
 try {
  // send {short_url: actual_url} to DB
  console.log("Connecting to database...");
  let short_url = Math.floor(Math.random()*1000000000);
  let urlEntry = {short_url: urlObject.href}; 
  const { MongoClient, ServerApiVersion } = require('mongodb');
  const uri = process.env.MONGO_URI;
  const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
  client.connect(err => {
    const collection = client.db("test").collection("devices");
    // perform actions on the collection object
    console.log("nothing happened")
    client.close();
    res.send({
      original_url : urlObject.href, 
      short_url : short_url
    })    
  });
 } 
 catch (e) {
  console.log(e);
  // res.send({
  //   error: 'database connection failure'
  // })
 }
});

app.get('/api/shorturl/:short_url', (req,res) => {
  // Retrieve {req.params.short_url: actual_url}
  // Redirect to actual url
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});