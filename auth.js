import express from 'express'
const app = express()
const http = require('http').Server(app)
import bodyParser from 'body-parser'
import request from 'request'
import querystring from 'querystring'

const accessToken = ''
const refreshToken = ''
const trackUri = ''
const stateKey = 'spotify_auth_state'
const redirect_uri = 'https://schacks-music.glitch.me/callback'

const generateRandomString = length => {
  let text = ''
  const possible =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length))
  }
  return text
}

app.get('/login', (req, res) => {
  const state = generateRandomString(16)
  res.cookie(stateKey, state)
  const scope =
    'user-read-private user-read-email playlist-modify-private playlist-modify-public'
  res.redirect(
    `https://accounts.spotify.com/authorize?${querystring.stringify({
      response_type: 'code',
      client_id: process.env.CLIENT_ID,
      scope,
      redirect_uri,
      state
    })}`
  )
})

app.get('/callback', (req, res) => {
  const code = req.query.code || null
  const state = req.query.state || null
  const storedState = req.cookies ? req.cookies[stateKey] : null

  res.send(code)
})

app.get('/', (req, res) => res.redirect('/login'))

http.listen(3000)
