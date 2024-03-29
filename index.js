// Example express application adding the parse-dashboard module to expose Parse Dashboard compatible API routes.
const https = require('https');
const fs = require("fs");

var express = require('express');
var ParseServer = require('parse-server').ParseServer;
var ParseDashboard = require('parse-dashboard');
var path = require('path');
var nodemailer = require('nodemailer');

require('dotenv').config();

var api = new ParseServer({
    databaseURI: process.env.DATABASE_URI,
    cloud: __dirname + '/cloud/main.js',
    appId: process.env.APP_ID,
    masterKey: process.env.MASTER_KEY,
    serverURL: process.env.SERVER_URL,
    appName: process.env.APP_NAME
})

var dashboard = new ParseDashboard({
  apps: [
    {
      appId: process.env.APP_ID,
      masterKey: process.env.MASTER_KEY,
      serverURL: process.env.SERVER_URL,
      appName: process.env.APP_NAME,
    },
  ],
  users: [
    {
      user: 'ScrutinyAdmin001',//process.env.USERNAME || 'test',
      pass: '$2y$12$9Ut7yIlbT1WNMVrruBC0m.6Bgq8gkmZak8SE7pKrbQbTk1gzNkbVu'//process.env.PASSWORD || 'test'
    }
  ],
  "useEncryptedPasswords": true
});

var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_NAME,
    pass: process.env.EMAIL_PASS
  }
});

var app = express();
//app.enable('trust proxy');

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

// make the Parse Dashboard available at /
app.use('/dashboard', dashboard);

var mountPath = process.env.PARSE_MOUNT;
app.use(mountPath, api);

app.use('/', express.static(path.join(__dirname, '/public')));

app.get('/bonjour', function(req,res){
  console.log("[200] " + req.method + " to " + req.url);
  res.statusCode = 200
  try{
    res.send("Bonjour! Je suis vivant!");
  }
  catch(e){
    res.send(false);
  }
});

app.post('/feedback', function(req,res){
  console.log("[200] " + req.method + " to " + req.url);
  res.statusCode = 200

  var body = "";
  req.on('data', function(chunk) {
      body += chunk;
    }).on('end', async function() {

      let mreq = JSON.parse(body)
      var description = mreq.user  +" sent the following feedback:\n";
      description += mreq.feedback;

      var mailOptions = {
        from: process.env.EMAIL_NAME,
        to: process.env.EMAIL_NAME,
        subject: 'Feedback from: ' + mreq.user,
        text: description
      };

      try{
        transporter.sendMail(mailOptions, function(error, info){
          if (error) {
            console.log(error);
            res.send(null);
          } else {
            res.send('Email sent: ' + info.response);
            console.log('Email sent: ' + info.response);
          }
        });
        }
      catch(e){
        res.send(null);
        }
    });
});

app.post('/modelrequest', function(req,res){
  console.log("[200] " + req.method + " to " + req.url);
  res.statusCode = 200

  var body = "";
  req.on('data', function(chunk) {
      body += chunk;
    }).on('end', async function() {

      let mreq = JSON.parse(body)
      var model = mreq.model;
      var description = mreq.user  +" requested a : " + model +"\n\n";
      description += "Description: \n";
      description += mreq.description

      var mailOptions = {
        from: process.env.EMAIL_NAME,
        to: process.env.EMAIL_NAME,
        subject: 'Model Request: ' + model,
        text: description
      };

      try{
        transporter.sendMail(mailOptions, function(error, info){
          if (error) {
            console.log(error);
            res.send(null);
          } else {
            res.send('Email sent: ' + info.response);
            console.log('Email sent: ' + info.response);
          }
        });
        }
      catch(e){
        res.send(null);
        }
    });
});

//Request
app.post('/login', function(req,res){
  console.log("[200] " + req.method + " to " + req.url);
  res.statusCode = 200

  var body = "";
  req.on('data', function(chunk) {
      body += chunk;
    }).on('end', async function() {

    try{
      let jsonUSer = JSON.parse(body)
      let username = jsonUSer.user
      let pwd = jsonUSer.pwd

      //console.log(username);
      //console.log(pwd);

      var user = Parse.User
              .logIn(username, pwd).then(function(user) {
                  console.log('User created successful with name: ' + user.get("username") + ' and email: ' + user.get("email"));
                  let userInfo = user.id+"|"+user.get("email");
                  res.send(userInfo);
          }).catch(function(error){
              console.log("Error: " + error.code + " " + error.message);
              res.send("invalid");
          });
    } catch (e) { res.send("timeout"); }
  });
});

app.post('/loadscene', function(req,res){
  console.log("[200] " + req.method + " to " + req.url);
  res.statusCode = 200

  var body = "";
  req.on('data', function(chunk) {
      body += chunk;
    }).on('end', async function() {

    try{
      let jsonSceneId = JSON.parse(body)

      console.log(jsonSceneId.id);

      Parse.Cloud.run('getSceneFromId', {jsonSceneId}).then((scenes) => {
        let scene = scenes[0];
        console.log(scene.get("json"));
        res.send(scene.get("json"));
      }).catch(console.log)
    } catch (e) { res.send(false) }
  });
});

app.post('/loadscenes', function(req,res){
  console.log("[200] " + req.method + " to " + req.url);
  res.statusCode = 200

  var body = "";
  req.on('data', function(chunk) {
      body += chunk;
    }).on('end', async function() {

    try{
      let jsonUserId = JSON.parse(body)

      Parse.Cloud.run('getScenesOfUser', {jsonUserId}).then((scenes) => {
        let jsonscenes = []
        for(var a in scenes){
          let scene = scenes[a]
          jsonscenes.push(JSON.parse(scene.get("json")));
        }
        //console.log(jsonscenes[0]);
        res.send(jsonscenes);
      }).catch(console.log)
    } catch (e) { res.send(false) }
  });
});

app.post('/savescene', function(req,res){
  console.log("[200] " + req.method + " to " + req.url);
  res.statusCode = 200

  var body = "";
  req.on('data', function(chunk) {
      body += chunk;
    }).on('end', async function() {

    try{
      let savedScene = JSON.parse(body)


      Parse.Cloud.run('saveScene', {savedScene}).then((savedSceneId) => {
        console.log(savedSceneId);
        res.send(savedSceneId);
      }).catch(function(error){
          console.log("Error: " + error.code + " " + error.message);
          res.send("error");
      });
    } catch (e) { res.send(false) }
  });
});

app.post('/deletescene', function(req,res){
  console.log("[200] " + req.method + " to " + req.url);
  res.statusCode = 200

  var body = "";
  req.on('data', function(chunk) {
      body += chunk;
    }).on('end', async function() {

    try{
      let deletedScene = JSON.parse(body)


      Parse.Cloud.run('deleteSceneFromId', {deletedScene}).then((deletedSceneId) => {
        console.log("Delete " + deletedSceneId);
        res.send(deletedSceneId.id);
      }).catch(function(error){
          console.log("Error: " + error.code + " " + error.message);
          res.send("error");
      });
    } catch (e) { res.send(false) }
  });
});


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
httpServer.listen(port, function() {
  console.log('HTTP: Scrutiny server running on port ' + port + '.');
});
