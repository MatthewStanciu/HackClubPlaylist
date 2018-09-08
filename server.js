var express = require('express');
var app = express();
var http = require('http').Server(app);
var cors = require('cors');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var request = require('request');
var storage = require('node-persist');
var querystring = require('querystring');
var refresh = require('spotify-refresh');
require('dotenv').config();

storage.initSync();

var stateKey = 'spotify_auth_state';
var redirect_uri = 'http://localhost:3000/callback'

function getIDfromUrl(url) {
  var split1 = url.split('/');
  var split2 = split1[4].split('?');

  return split2[0];
}

app.use('/public', express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());
app.use(cookieParser());

app.post('/song', function(req, res) {
  refresh(process.env.REFRESH_TOKEN, process.env.CLIENT_ID, process.env.CLIENT_SECRET, function(err, res, body) {
    if (err) return err;
    request.post({
      url: 'https://api.spotify.com/v1/playlists/5dPp7yV9i8mELe1Kk9UC6D/tracks?uris=spotify%3Atrack%3A' +
        getIDfromUrl(req.body.submituri),
      headers: {
        'Authorization': 'Bearer ' + body.access_token,
        'Host': 'api.spotify.com',
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      json: true
    });
  });

  console.log("added " + getIDfromUrl(req.body.submituri) + " to the playlist");
  res.redirect("/added");
})


app.get("/", function(err, res) {
  res.sendFile(__dirname + "/index.html");
})
app.get("/added", function(err, res) {
  res.sendFile(__dirname + "/added.html");
})

http.listen(3000);
