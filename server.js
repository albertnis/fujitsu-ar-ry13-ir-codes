const express = require('express')

const fuj = require('./fujitsu')
const { makeFujitsuPayload, addProntoMetadata, MODE, FANSPEED, SWING } = fuj

const p2b = require('./pronto2broadlink')
const { pronto2broadlink } = p2b

const app = express()
const router = express.Router()

const path = __dirname
const port = 8080

router.get('/broadlink', function (req, res) {
  let { tempC, mode, fanSpeed, swing, powerOn } = req.query

  var payload = makeFujitsuPayload(tempC, MODE[mode.toLowerCase()], FANSPEED[fanSpeed.toLowerCase()], SWING[swing.toLowerCase()], powerOn)
  
  var pronto = addProntoMetadata(payload, 39e3, [0x7C, 0x3E], [0x10, 0x130], [0x10, 0x2E], [0x10, 0x10])
  
  var b64 = pronto2broadlink(pronto)

  res.end(b64)
})

router.get('/pronto', function (req, res) {
  let { tempC, mode, fanSpeed, swing, powerOn } = req.query

  var payload = makeFujitsuPayload(tempC, MODE[mode.toLowerCase()], FANSPEED[fanSpeed.toLowerCase()], SWING[swing.toLowerCase()], powerOn)
  
  var pronto = addProntoMetadata(payload, 39e3, [0x7C, 0x3E], [0x10, 0x130], [0x10, 0x2E], [0x10, 0x10])

  res.end(pronto)
})

app.use(express.static(path));
app.use('/', router);

app.listen(port, function () {
  console.log('Listening on port 8080')
})