// Example express application adding the parse-dashboard module to expose Parse Dashboard compatible API routes.



const https = require('https');
const fs    = require("fs");


var express        = require('express');                                        //Web development frameework for node and javascript applications
var ParseServer    = require('parse-server').ParseServer;                       //Parse Server itself
var ParseDashboard = require('parse-dashboard');
var path           = require('path');
var nodemailer     = require('nodemailer');



require('dotenv').config();


//Configurations for the parse server named api - In production it's important to put these away securely, below it is secured by not having hardcoded information
var api = new ParseServer
({
    databaseURI: process.env.DATABASE_URI,                                      //where the database is located
    cloud:       __dirname + '/cloud/main.js',                                  //where the cloud code file is located
    appId:       process.env.APP_ID,                                            //App ID
    masterKey:   process.env.MASTER_KEY,                                        //Master key of current app
    serverURL:   process.env.SERVER_URL,                                        //Server URL example of default: http://localhost:1337/parse
    appName:     process.env.APP_NAME                                           //App Name
})

//Parse dashboard is a spreadsheet like interface for editing rows, representing relationships, and performing GrapqhQL / REST queries.
var dashboard = new ParseDashboard
({
  apps: 
  [
    {
      appId:     process.env.APP_ID,                                            //App ID
      masterKey: process.env.MASTER_KEY,                                        //Master key
      serverURL: process.env.SERVER_URL,                                        //If your Parse Server’s endpoint is not at /parse, you need to replace /parse with the correct endpoint
      appName:   process.env.APP_NAME,                                          //App Name
    },
  ],

  users: 
  [
    {
      // Used to log in to your Parse Dashboard
      user: 'ScrutinyAdmin001',                                             // process.env.USERNAME || 'test',
      pass: '$2y$12$9Ut7yIlbT1WNMVrruBC0m.6Bgq8gkmZak8SE7pKrbQbTk1gzNkbVu'  // process.env.PASSWORD || 'test'
    }
  ],

  "useEncryptedPasswords": true
});

//SMTP is the main transport in Nodemailer for delivering messages
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

//ExpressJS Routing
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
