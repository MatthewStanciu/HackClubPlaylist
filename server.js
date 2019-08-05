const express = require('express')
const app = express()
const http = require('http').Server(app)

const bodyParser = require('body-parser')
const request = require('request')
const refresh = require('spotify-refresh')
const Spotify = require('spotify-web-api-node')
require('dotenv').config()

const spotify = new Spotify()
spotify.setRefreshToken(process.env.REFRESH_TOKEN)
spotify.setClientId(process.env.CLIENT_ID)
spotify.setClientSecret(process.env.CLIENT_SECRET)

function getIDfromUri(uri) {
  const split = uri.split(/[:\"]+/)
  return split[3]
}

const post = uri =>
  request.post({
    url: `https://api.spotify.com/v1/playlists/5dPp7yV9i8mELe1Kk9UC6D/tracks?uris=spotify%3Atrack%3A${getIDfromUri(
      uri
    )}`,
    headers: {
      Authorization: `Bearer ${spotify.getAccessToken()}`,
      Host: 'api.spotify.com',
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'Content-Length': 0
    },
    json: true
  })

app.use('/public', express.static('public'))
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.post('/song', (req, res) => {
  const track = req.body.submiturl
  const artist = req.body.submitartist

  spotify
    .searchTracks(artist != '' ? `track:${track} artist:${artist}` : track)
    .then(
      data => {
        const uri = JSON.stringify(data.body['tracks']['items'][0]['uri'])
        const isExplicit = JSON.stringify(
          data.body['tracks']['items'][0]['explicit']
        )
        if (isExplicit === 'true') {
          console.log(`requested song ${track} not added because it's explicit`)
          return res.sendFile(__dirname + '/index.html')
        } else {
          post(uri)
          console.log(`added ${track} to the playlist!`)
          return res.sendFile(__dirname + '/added.html')
        }
      },
      err => {
        console.log(err)
      }
    )
})

app.get('/', (err, res) => {
  res.sendFile(`${__dirname}/index.html`)

  spotify.refreshAccessToken().then(
    data => {
      spotify.setAccessToken(data.body['access_token'])
    },
    err => {
      console.log('Could not refresh access token', err)
    }
  )
})

app.get('/added', (err, res) => {
  res.sendFile(`${__dirname}/added.html`)
})

http.listen(3000)
