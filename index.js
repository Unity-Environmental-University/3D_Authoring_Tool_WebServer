// Example express application adding the parse-dashboard module to expose Parse Dashboard compatible API routes.



const https = require('https');
const fs    = require("fs");


var express        = require('express');
var ParseServer    = require('parse-server').ParseServer;
var ParseDashboard = require('parse-dashboard');
var path           = require('path');
var nodemailer     = require('nodemailer');



require('dotenv').config();



var api = new ParseServer
({
    databaseURI: process.env.DATABASE_URI,
    cloud:       __dirname + '/cloud/main.js',
    appId:       process.env.APP_ID,
    masterKey:   process.env.MASTER_KEY,
    serverURL:   process.env.SERVER_URL,
    appName:     process.env.APP_NAME
})

var dashboard = new ParseDashboard
({
  apps: 
  [
    {
      appId:     process.env.APP_ID,
      masterKey: process.env.MASTER_KEY,
      serverURL: process.env.SERVER_URL,
      appName:   process.env.APP_NAME,
    },
  ],

  users: 
  [
    {
      user: 'ScrutinyAdmin001',                                             // process.env.USERNAME || 'test',
      pass: '$2y$12$9Ut7yIlbT1WNMVrruBC0m.6Bgq8gkmZak8SE7pKrbQbTk1gzNkbVu'  // process.env.PASSWORD || 'test'
    }
  ],

  "useEncryptedPasswords": true
});

var transporter = nodemailer.createTransport
({
  service: 'gmail',

  auth: 
  {
    user: process.env.EMAIL_NAME,
    pass: process.env.EMAIL_PASS
  }
});

var app = express();

//app.enable('trust proxy');

app.use((req, res, next) =>
{
  // Update to match the domain you will make the request from
  res.header("Access-Control-Allow-Origin", "*");    
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

  next();
});


// Make the Parse Dashboard available at /
app.use('/dashboard', dashboard);

var mountPath = process.env.PARSE_MOUNT;

app.use(mountPath, api);

app.use('/', express.static(path.join(__dirname, '/public')));

app.get('/bonjour', (req, res) =>
{
  console.log("[200] " + req.method + " to " + req.url);

  res.statusCode = 200

  try
  {
    res.send("Bonjour! Je suis vivant!");
  }
  catch(e)
  {
    res.send(false);
  }
});


var EngineRequests = require("./EngineRequests");

app.post('/feedback'    , EngineRequests.Handle_Feedback    (req, res));
app.post('/modelrequest', EngineRequests.Handle_ModelRequest(req, res));
app.post('/login'       , EngineRequests.Handle_Login       (req, res));
app.post('/loadscene'   , EngineRequests.Handle_LoadScene   (req, res));
app.post('/loadscenes'  , EngineRequests.Handle_LoadScenes  (req, res));
app.post('/savescene'   , EngineRequests.Handle_SaveScene   (req, res));
app.post('/deletescene' , EngineRequests.Handle_DeleteScene (req, res));

var port = process.env.PORT;

/*
var options = {
    key: fs.readFileSync('./keys/privkey.pem'),
    cert: fs.readFileSync('./keys/cert.pem'),
};

const httpsServer = https.createServer(options,app);
httpsServer.listen(port, function() {
  console.log('HTTPS: Scrutiny server running on port ' + port + '.');
});
*/

var httpServer = require('http').createServer(app);


httpServer.listen(port, () => { console.log('HTTP: Scrutiny server running on port ' + port + '.'); });
