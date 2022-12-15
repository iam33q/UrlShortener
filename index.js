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

var Connection = require('tedious').Connection;  
var Request = require('tedious').Request;  
var TYPES = require('tedious').TYPES;  

var config = {  
    server: 'localhost',  //update me
    authentication: {
        type: 'default',
        options: {
            userName: 'SA', 
            password: 'Adminxyz22#'
        }
    },
    options: {
        // If you are on Microsoft Azure, you need encryption:
        encrypt: true,
        trustServerCertificate: true,
        database: 'model'  //update me
    }
};  
var connection = new Connection(config);  
connection.on('connect', function(err) {  
    if (err) console.log(err);
    else console.log("DB Connected");  
});

connection.connect();
function insertUrl(shortUrl, longUrl) {  
    const request = new Request(`INSERT INTO master.dbo.Urls (original_url, short_url) VALUES (@longurl, @shorturl);`, function(err) {  
      if (err) console.log(err);  
    });  
    request.addParameter('longurl',TYPES.VarChar, longUrl);
    request.addParameter('shorturl', TYPES.VarChar, shortUrl);
    request.on('done', function(rowCount, more) {  
      console.log(rowCount + ' rows returned');  
    });  
    // Close the connection after the final event emitted by the request, after the callback passes
    request.on("requestCompleted", function (rowCount, more) {
      console.log("URL successfully added to database.")
    });
    connection.execSql(request);  
}

function selectUrl(shortUrl) {
  var sql = `SELECT * FROM master.dbo.Urls WHERE short_url = @shorturl`
  const request = new Request(sql,(err) => {
    if (err) console.log(err);
  })
  request.addParameter('shorturl', TYPES.VarChar, shortUrl);
  request.addOutputParameter('retrieved_data',TYPES.VarChar)
  request.on('returnValue', function(parameterName, value, metadata) {
    console.log(parameterName + ' = ' + value);
  });
  connection.execSql(request);
}

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.post('/api/shorturl', async (req, res) => {
  let rawUrl = req.body.url;
  let urlObject;
  try {
    urlObject = new URL(rawUrl);
    const gg = await dns.promises.resolve(urlObject.hostname);
    let short_url = Math.floor(Math.random()*1000000000).toString();
    let urlEntry = {short_url: short_url, original_url: urlObject.hostname}; 
    insertUrl(urlEntry.short_url,urlEntry.original_url);
    res.send(urlEntry);
  } catch (e) {
    console.log(e);
    res.json({
      error: 'invalid url'
    })
  };
});

app.get('/api/shorturl/:short_url', (req,res) => {
  const retrievedData = selectUrl(req.params.short_url);
  res.send({"url":req.params.short_url});
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});