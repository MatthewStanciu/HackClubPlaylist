var express = require('express');
var app = express();
var http = require('http').Server(app);
var bodyParser = require('body-parser');
var request = require('request');
var refresh = require('spotify-refresh');
var Spotify = require('node-spotify-api');
require('dotenv').config();

var spotify = new Spotify({
  id: process.env.CLIENT_ID,
  secret: process.env.CLIENT_SECRET
});

trackUri = "";

function getIDfromUrl(url) {
  var split = url.split(/[?/]+/);
  return split[3];
}

app.use('/public', express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

function post(uri, access_token) {
  request.post({
    url: 'https://api.spotify.com/v1/playlists/5dPp7yV9i8mELe1Kk9UC6D/tracks?uris=spotify%3Atrack%3A' +
      uri,
    headers: {
      'Authorization': 'Bearer ' + access_token,
      'Host': 'api.spotify.com',
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    json: true
  });

  console.log("uri: " + uri);
}

app.post('/song', function(req, postRes) {
  var formatted = (req.body.submiturl).replace(" ", "%20");
    spotify.search({type: 'track', query: formatted,limit: 5})
    .then(function(result) {
      /*for (var i = 0; i < 5; i++) {
        console.log((req.body.submitartist).toUpperCase());
        console.log((result['tracks']['items'][i]['artists'][i]['name']).toUpperCase());
        if (req.body.submitartist === "") break;
        if ((req.body.submitartist).toUpperCase() == (result['tracks']['items'][i]['artists'][i]['name']).toUpperCase()) {
          post(result['tracks']['items'][i]['uri'], body.access_token);
          console.log(result['tracks']['items'][i]['artists'][i]['name']);
          console.log("added " + req.body.submiturl + " to the playlist");
          return postRes.redirect("/add");
        }
      }
      console.log(result['tracks']['items'][0]['artists'][0]['name']);
      post(result['tracks']['items'][0]['uri'], body.access_token);
      console.log("added " + req.body.submiturl + " to the playlist");
      return postRes.redirect("/add");*/
      console.log(result['tracks']['items'][2]['artists'][1]['name']);
    })
})

app.get('/add', function(req, res) {
  console.log(trackUri);
})

app.get("/", function(err, res) {
  res.sendFile(__dirname + "/index.html");
})
app.get("/added", function(err, res) {
  res.sendFile(__dirname + "/added.html");
})

http.listen(3000);
