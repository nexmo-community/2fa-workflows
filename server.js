require('dotenv').config();
const express = require('express');
const app = express();

app.use(express.urlencoded());
app.use(express.json());
app.use(express.static('public'));

const Vonage = require('@vonage/server-sdk');
const vonage = new Vonage({
  apiKey: process.env.API_KEY,
  apiSecret: process.env.API_SECRET
});

// init sqlite db
const fs = require('fs');
const dbFile = './data/sqlite.db';
var exists = fs.existsSync(dbFile);
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database(dbFile);

// if ./.data/sqlite.db does not exist, create it
db.serialize(function(){
  if (!exists) {
    db.run('CREATE TABLE Sessions (phone NUMERIC, id TEXT)');
    db.run('CREATE TABLE Users (phone NUMERIC, username TEXT)');
  }
});

const session = require('express-session');
const SQLiteStore = require('connect-sqlite3')(session);

//app.use(express.methodOverride());
app.use(require('cookie-parser')());
app.use(session({
  store: new SQLiteStore,
  secret: process.env.SESH_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 7 * 24 * 60 * 60 * 1000 } // 1 week
}));


// APPLICATION ENDPOINTS

// user submits a phone number to invite to register
app.post('/invite', function(request, response) {
  let from = request.body.phone;
  
  vonage.verify.request({
    number: from,
    brand: 'Vonage',
    workflow_id: 6
  }, (err, result) => {
    if (err) {
      response.status(500).send(err);
    } else {
      db.run('INSERT INTO Sessions (phone, id) VALUES ($phone, $id)', {
        $phone: from,
        $id: result.request_id
      });
      response.send({});
    }
  });
});

// user registers with new username and phone number
app.post('/register', function(request, response) {
  let allowed = RegExp('[A-Za-z0-9_-]+');
  let username = request.body.username;
  if (!allowed.test(username)) {
    response.status(500).send({message: 'Please use basic characters for your username'});
    return;
  }
  
  db.each('SELECT * FROM Sessions WHERE phone = $phone', {
    $phone: request.body.phone
  }, function(error, sesh) {
      
    vonage.verify.check({
      request_id: sesh.id,
      code: request.body.pin
    }, (err, result) => {
      if (err) {
        response.status(500).send({message:'Error verifying your info'});
      } 
      if (result.status === '0') {
        db.serialize(function() {
          db.run('DELETE FROM Sessions WHERE phone = $phone', {
            $phone: sesh.phone
          });
          db.run('INSERT INTO Users (phone, username) VALUES ($phone, $username)', {
            $phone: sesh.phone,
            $username: username
          });
        });
        request.session.username = username;
        response.send({message: "You're registered and logged in!"});
      }
    });
     
  });
});

// user enters their new or existing username
// they then receive a client-side cookie keeping them semi-logged in
app.post('/login', function(request, response) {
  let username = request.body.username;
  
  db.each('SELECT * FROM Users WHERE username = $username', {
    $username: username 
  }, function(error, user) {
  
    vonage.verify.request({
      number: user.phone,
      brand: 'Vonage',
      workflow_id: 6
    }, (err, result) => {
      if (err) {
        response.status(500).send({message:'Error processing verification request'});
      } else {
        db.run('INSERT INTO Sessions (phone, id) VALUES ($phone, $id)', {
          $phone: user.phone,
          $id: result.request_id
        });
        response.send({});
      }
    });
  });
  
});

// user enters the PIN they received to authenticate and complete their login
app.post('/authenticate', function(request, response) {
  let username = request.body.username;
  
  db.each('SELECT * FROM Users WHERE username = $username', {
    $username: username 
  }, function(error, user) {

    db.each('SELECT * FROM Sessions WHERE phone = $phone', {
      $phone: user.phone
    }, function(error, sesh) {
        
      vonage.verify.check({
        request_id: sesh.id,
        code: request.body.pin
      }, (err, result) => {
        if (err) {
          response.status(500).send({message:'Error verifying your info'});
        } 
        if (result.status === '0') {
          db.serialize(function() {
            db.run('DELETE FROM Sessions WHERE phone = $phone', {
              $phone: sesh.phone
            });
          });
          request.session.username = username;
          response.send({message: "You're logged in!"});
        }
      });
      
    });
  }); 
});

app.get('/', function(request, response) {
  response.sendFile(__dirname + '/public/index.html');
});

app.listen(5000);