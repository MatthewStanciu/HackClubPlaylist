var express = require('express');
var app = express();
var http = require('http').Server(app);
var bodyParser = require('body-parser');
var request = require('request');
var storage = require('node-persist');
var querystring = require('querystring');
require('dotenv').config();

storage.initSync();

function getIDfromUri(uri) {
  var split = uri.split(':');
  return split[2];
}

app.use('/public', express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.post("/song", function(req, res) {
  var scope = 'playlist-modify-private user-read-currently-playing user-read-playback-state user-read-private user-read-email user-read-playback-state playlist-modify-public';
  storage.setItemSync('trackuri', req.body.submituri);
  res.redirect('https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      response_type: 'code',
      client_id: '69bba9499b994329960c1da43327bed4',
      scope: scope,
      redirect_uri: 'http://localhost:3000/callback',
      show_dialog: true
    }));
});

app.get("/callback", function(req, response) {
  var uri = getIDfromUri(storage.getItemSync('trackuri'));
  var code = req.query.code || null;
  var authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    headers: {
      'Authorization': 'Basic ' + (new Buffer(process.env.CLIENT_ID+':'+process.env.CLIENT_SECRET).toString('base64'))
    },
    form: {
      code: code,
      redirect_uri: 'http://localhost:3000/callback',
      grant_type: 'authorization_code'
    },
    json: true
  };

  request.post(authOptions, function(err, res, body) {
      var token = body.access_token;
      var refresh = body.refresh_token;
      console.log("access: " + token);
      console.log("refresh: " + refresh);
      var uri = storage.getItemSync('trackuri');
      console.log(token);
      var options = {
        url: 'https://api.spotify.com/v1/users/matthewstanciu/playlists/5dPp7yV9i8mELe1Kk9UC6D/tracks?uris=spotify%3Atrack%3A'
          +uri,
        headers: {
          'Authorization': 'Bearer ' + token,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        json: true
      };
      request.get(options, function(error, response, bod) {
        console.log(bod);
      });
  });
  response.redirect('/refresh_token');
})

app.get('/refresh_token', function(req, res) {
  var refresh_token = req.query.refresh_token;
  var authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    headers: {
      'Authorization': 'Basic ' + (new Buffer(process.env.CLIENT_ID+':'+process.env.CLIENT_SECRET).toString('base64'))
    },
    form: {
      grant_type: 'refresh_token',
      refresh_token: refresh_token
    },
    json: true
  };

  request.post(authOptions, function(error, response, body) {
    storage.setItemSync('token', body.access_token);
  });
  res.redirect('/#access_token=' + body.access_token + '&refresh_token=' + refresh_token);
});

app.get("/", function(request, response) {
  response.sendFile(__dirname + '/index.html');
});

http.listen(3000);
