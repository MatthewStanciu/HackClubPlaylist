var express = require('express');
var app = express();
var http = require('http').Server(app);
var request = require('request');

function getIDfromUri(uri) {
  var split = uri.split(':');
  return split[2];
}

app.use('/public', express.static('public'));

app.post("/song", function(response, req) {
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
    if (!err && response.statusCode === 200) {
      var token = body.access_token;
      var options = {
        url: 'https://api.spotify.com/v1/playlists/5dPp7yV9i8mELe1Kk9UC6D/tracks?uris=spotify%3Atrack%3A'
          +getIDfromUri(request.body.submituri),
        headers: {
          'Authorization': 'Bearer ' + token,
          'Accept': 'application/json'
        },
        json: true
      };
      request.get(options, function(error, response, body) {
        console.log(body);
      });
    }
  })
});

app.get("/", function(request, response) {
  response.sendFile(__dirname + '/index.html');
});

http.listen(3000);
