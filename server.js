var express = require('express');
var app = express();
var http = require('http').Server(app);
var bodyParser = require('body-parser');
var request = require('request');
var refresh = require('spotify-refresh');
require('dotenv').config();

function getIDfromUrl(url) {
  var split = url.split(/[?/]+/);
  return split[3];
}

app.use('/public', express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.post('/song', function(req, res) {
  refresh(process.env.REFRESH_TOKEN, process.env.CLIENT_ID, process.env.CLIENT_SECRET, function(err, res, body) {
    if (err) return err;
    request.post({
      url: 'https://api.spotify.com/v1/playlists/5dPp7yV9i8mELe1Kk9UC6D/tracks?uris=spotify%3Atrack%3A' +
        getIDfromUrl(req.body.submiturl),
      headers: {
        'Authorization': 'Bearer ' + body.access_token,
        'Host': 'api.spotify.com',
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      json: true
    });
  });

  console.log("added " + req.body.submiturl + " to the playlist");
  res.redirect("/added");
})


app.get("/", function(err, res) {
  res.sendFile(__dirname + "/index.html");
})
app.get("/added", function(err, res) {
  res.sendFile(__dirname + "/added.html");
})

http.listen(3000);
