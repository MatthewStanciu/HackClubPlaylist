var express = require('express');
var app = express();
var http = require('http').Server(app);
var bodyParser = require('body-parser');
var request = require('request');
var storage = require('node-persist');
var querystring = require('querystring');
require('dotenv').config();

storage.initSync();

var accessToken = '';
var refreshToken = '';
var trackUri = '';

function getIDfromUri(uri) {
  var split = uri.split(':');
  return split[2];
}

app.use('/public', express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/login', function(req, res) {
  var scope = 'user-read-email user-read-playback-state playlist-modify-public';
  res.redirect('https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      client_id: process.env.CLIENT_ID,
      response_type: 'code',
      redirect_uri: 'http://localhost:3000/callback',
      scope: scope,
      show_dialog: true
    })
  )
});

app.get('/callback', function(req, res) {
  var code = req.query.code || null;
  var authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    form: {
      code: code,
      redirect_uri: 'http://localhost:3000',
      grant_type: 'authorization_code'
    },
    headers: {
      'Authorization': 'Basic ' + (new Buffer(process.env.CLIENT_ID + ':' + process.env.CLIENT_SECRET).toString('base64'))
    },
    json: true
  }

  request.post(authOptions, function(err, response, body) {
    var access_token = body.access_token;
    var refresh_token = body.refresh_token;
    console.log("access token: " + access_token);
    console.log("refresh token: " + refresh_token);

    accessToken = access_token;
    refreshToken = refresh_token;
    storage.setItemSync('token', accessToken);
    storage.setItem('refresh', refreshToken);

    var options = {
      url: 'https://api.spotify.com/v1/me',
      headers: { 'Authorization': 'Bearer ' + access_token },
      json: true
    }
    request.get(options, function(error, response, body) {
      console.log("authenticated");
      console.log(body);
    });
    res.redirect('/addsong#' + querystring.stringify({
      access_token: access_token,
      refresh_token: refresh_token
    }))
  })
})

app.get("/addsong", function(req, res) {
  console.log("at: " + accessToken);
  request.post({
    url: 'https://api.spotify.com/v1/users/matthewstanciu/playlists/5dPp7yV9i8mELe1Kk9UC6D/tracks?uris=spotify%3Atrack%3A'
    + trackUri,
    headers: {
      'Authorization': 'Bearer ' + accessToken,
      'Accept': 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    json: true
  })
});

app.post('/song', function(req, res) {
  var uri = getIDfromUri(req.body.submituri);
  trackUri = uri;
  res.redirect('/login');
})

app.get('/refresh_token', function(req, res) {
  var refresh_token = req.query.refresh_token;
  console.log(req.query);
  var authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    headers: {
      'Authorization': 'Basic ' + (new Buffer(process.env.CLIENT_ID + ':' + process.env.CLIENT_SECRET).toString('base64'))
    },
    form: {
      grant_type: 'refresh_token',
      refresh_token: refresh_token
    },
    json: true
  };

  request.post(authOptions, function(err, response, body) {
    var access_token = body.access_token;
    console.log(body);
    console.log(access_token);
    accessToken = access_token;
    storage.setItemSync('token', accessToken);
    storage.setItemSync('refresh', refreshToken)

    res.redirect('/#access_token=' + access_token + '&refresh_token=' + refresh_token);
  })
});

app.get("/", function(err, res) {
  res.sendFile(__dirname + "/index.html");
})

http.listen(3000);
