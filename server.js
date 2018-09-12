var express = require('express');
var app = express();
var http = require('http').Server(app);
var bodyParser = require('body-parser');
var request = require('request');
var refresh = require('spotify-refresh');
var Spotify = require('spotify-web-api-node');
require('dotenv').config();

var spotify = new Spotify({
  accessToken: 'BQCSejhAJRE3QQVHfhfu-4XFrC317fRkMC0IRqPcVklhUU0SJfq-dpNRSkRKBeic7luZjkmLJcAUCgLVnR-PtwUZFFajmNEq_Dvnun8zVA2ik8at4nUxW1TEap24SAVgTATYNhoCVBQAnO82UvC2TkyfOYJifTiz7Ajh6SuwUIBNxmusdGd4xWTB5vNgflpAP5-NFu-Jhsctwu9hUVwWsLasGITSLbBPAA6nGo4xaA'
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
  /*refresh(process.env.REFRESH_TOKEN, process.env.CLIENT_ID, process.env.CLIENT_SECRET, function(err, res, body) {
    console.log(body.access_token);
    spotify.setAccessToken(body.access_token);
  })*/
  var formatted = (req.body.submiturl).replace(" ", "%20");
  var formattedArtist = (req.body.submitartist).replace(" ", "%20")
  spotify.searchTracks('track:Alright artist:Kendrick Lamar')
  .then(function(data) {
    console.log('Search tracks by "Alright" in the track name and "Kendrick Lamar" in the artist name', data.body);
  }, function(err) {
    console.log('Something went wrong!', err);
  });
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
