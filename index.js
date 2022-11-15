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

//DB setup
const mongoose = require("mongoose");
const urlSchema = new mongoose.Schema({
  short_url: String,
  original_url: String
})
var urlModel = mongoose.model('Url', urlSchema);

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.post('/api/shorturl', async (req, res) => {
  let rawUrl = req.body.url;
  let urlObject;
  try {
    urlObject = new URL(rawUrl);
    console.log(urlObject);
    const gg = await dns.promises.resolve(urlObject.hostname);

    console.log("Connecting to database...");
    let short_url = Math.floor(Math.random()*1000000000);
    let urlEntry = {short_url: urlObject.hostname}; 
    const uri = process.env.MONGO_URI;
    const mongoptions = { 
      useNewUrlParser: true, 
      useUnifiedTopology: true, 
      connectTimeoutMS: 25000,
      socketTimeoutMS: 25000,
    }
    mongoose.connect(uri,mongoptions,async (err) => {
      const DBEntry = new urlModel({
        short_url: String,
        original_url: String
      });
      await DBEntry.save(err=> {
        if(err) console.log(err);
        else res.send({
          original_url : urlObject.hostname, 
          short_url : short_url
        })
      })
      console.log("something happened")
    });
  } 
  catch (e) {
    console.log(e);
    res.json({
      error: 'invalid url'
    })
  };
});

app.get('/api/shorturl/:short_url', (req,res) => {
  // Retrieve {req.params.short_url: actual_url}
  // Redirect to actual url
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});