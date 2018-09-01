var express = require('express');
var app = express();
var http = require('http').Server(app);
var bodyParser = require('body-parser');
var request = require('request');

function getIDfromUri(uri) {
  var split = uri.split(':');
  return split[2];
}

app.use('/public', express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.post("/song", function(req, response) {
  var uri = getIDfromUri(req.body.submituri);
  var authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    headers: {
      'Authorization': 'Basic ' + (new Buffer(process.env.CLIENT_ID + ':' + process.env.CLIENT_SECRET).toString('base64'))
    },
    form: {
      grant_type: 'client_credentials'
    },
    json: true
  };

  request.post(authOptions, function(err, res, body) {
      var token = body.access_token;
      var options = {
        url: 'https://api.spotify.com/v1/playlists/5dPp7yV9i8mELe1Kk9UC6D/tracks?uris=spotify%3Atrack%3A'
          +uri,
        headers: {
          'Authorization': 'Bearer ' + token,
          'Accept': 'application/json'
        },
        json: true
      };
      request.get(options, function(error, response, bod) {
        console.log(bod);
      });

  })
});

app.get("/", function(request, response) {
  response.sendFile(__dirname + '/index.html');
});

http.listen(3000);
