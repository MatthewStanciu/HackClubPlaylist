var express = require('express');
var app = express();
var http = require('http').Server(app);
var bodyParser = require('body-parser');
var request = require('request');
var refresh = require('spotify-refresh');
var Spotify = require('spotify-web-api-node');
require('dotenv').config();

var spotify = new Spotify();
spotify.setRefreshToken(process.env.REFRESH_TOKEN);
spotify.setClientId(process.env.CLIENT_ID);
spotify.setClientSecret(process.env.CLIENT_SECRET);

function getIDfromUri(uri) {
  var split = uri.split(/[:\"]+/);
  return split[3];
}

function post(uri) {
  request.post({
    url: 'https://api.spotify.com/v1/playlists/5dPp7yV9i8mELe1Kk9UC6D/tracks?uris=spotify%3Atrack%3A' +
      getIDfromUri(uri),
    headers: {
      'Authorization': 'Bearer ' + spotify.getAccessToken(),
      'Host': 'api.spotify.com',
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Content-Length': 0
    },
    json: true
  });
}

app.use('/public', express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.post('/song', function(req, res) {
  var track = (req.body.submiturl);
  var artist = (req.body.submitartist);

  if (artist != "") {
    spotify.searchTracks('track:'+track+ ' artist:'+ artist)
    .then(function(data) {
      var uri = JSON.stringify(data.body['tracks']['items'][0]['uri']);
      post(uri);
      console.log("added " + track + " by " + artist +" to the playlist!");
    }, function(err) {
      console.log(err);
    })
  } else {
    spotify.searchTracks(track)
    .then(function(data) {
      var uri = data.body['tracks']['items'][0]['uri'];
      post(uri);
      console.log("added " + track + " to the playlist!");
    }, function(err) {
      console.log(err);
    })
  }

  res.redirect('/added');
})

app.get("/", function(err, res) {
  res.sendFile(__dirname + "/index.html");

  spotify.refreshAccessToken().then(function(data) {
    spotify.setAccessToken(data.body['access_token']);
  },function(err) {
    console.log('Could not refresh access token', err);
    }
  );
})
app.get("/added", function(err, res) {
  res.sendFile(__dirname + "/added.html");
})

http.listen(3000);
