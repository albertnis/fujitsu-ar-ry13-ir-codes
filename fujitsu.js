const checksum = require('./makeChecksum')

const MODE = {
  auto: 0x0,
  cool: 0x8,
  dry: 0x4,
  fan: 0xc,
  heat: 0x2
}

const FANSPEED = {
  auto: 0x0,
  high: 0x8,
  quiet: 0x2
}

const SWING = {
  off: 0x0,
  both: 0xc
}

function makeTemperatureCode(tempC) {
  // Clip between 16 and 30
  var temp = Math.round(tempC)
  temp = tempC > 30 ? 30 : tempC
  temp = tempC < 16 ? 16 : tempC
  return temp - 16
}

function makeChecksumCode(payload) {
  return checksum.makeChecksum(payload)
}

function concatBytes(a, b) {
  return (a << 4) + b
}

function makeFujitsuPayload(tempC, mode, fanSpeed, swingMode) {
  // [1-8] Codes M1, M2, P, C1, C2, D, U1, U2
  var payload = [0x28, 0xc6, 0x00, 0x08, 0x08, 0x7f, 0x90, 0x0c]

  // [9] Temp + On/off
  payload = [...payload, concatBytes(0x0, makeTemperatureCode(tempC))]

  // [10] Timer + Master
  payload = [...payload, concatBytes(mode, 0x0)]

  // [11] Swing mode + Fan speed
  payload = [...payload, concatBytes(fanSpeed, swingMode)]

  // [12] Timer off value (low)
  payload = [...payload, 0x00]

  // [13] Timer off value (high), New timer off (low)
  payload = [...payload, 0x00]

  // [14] Time on value (high)
  payload = [...payload, 0x00]

  // [15] U3
  payload = [...payload, 0x04]

  // [16] Checksum
  payload = [...payload, makeChecksumCode(payload)]

  return payload
}

function pad(num, size) {
  var s = num + "";
  while (s.length < size) s = "0" + s;
  return s;
}

function addProntoMetadata(payload, frequency, leaderPair, trailerPair, onePair, zeroPair) {
  for (var payloadBinary = "", i = 0; i < payload.length; i++) {
    payloadBinary += pad(payload[i].toString(2), 8)
  }

  //payloadBinary = "00101000110001100000000000001000000010000100000010111111"
  
  var oneHex = pad(onePair[0].toString(16), 4) + pad(onePair[1].toString(16), 4)
  var zeroHex = pad(zeroPair[0].toString(16), 4) + pad(zeroPair[1].toString(16), 4)
  for (var prontoHex = "", i = 0; i < payloadBinary.length; i++) {
    if (payloadBinary[i] === "1") {
      prontoHex += oneHex
    } else if (payloadBinary[i] === "0") {
      prontoHex += zeroHex
    }
  }

  var leaderHex = pad(leaderPair[0].toString(16), 4) + pad(leaderPair[1].toString(16), 4)
  var trailerHex = pad(trailerPair[0].toString(16), 4) + pad(trailerPair[1].toString(16), 4) 

  prontoHex = leaderHex + prontoHex + trailerHex

  var burstLength = prontoHex.length/8
  var burstLengthHex = pad(burstLength.toString(16), 4)

  var freqConv = Math.round(1e6 / (frequency * 0.241246))
  var freqConvHex = pad(freqConv.toString(16), 4)

  prontoHex = "0000" + freqConvHex + "0000" + burstLengthHex + prontoHex

  return prontoHex
}

function printArray(arr) {
  console.log(`[${arr.join(', ')}]`)
}

if (require.main === module) {
  var payload = makeFujitsuPayload(23, MODE.fan, FANSPEED.high, SWING.both)

  printArray(payload.map(b => `'${b.toString(16)}'`))

  var payloadBin = addProntoMetadata(payload, 39e3, [0x7C, 0x3E], [0x10, 0x130], [0x10, 0x2E], [0x10, 0x10])
  console.log(payloadBin)
}

module.exports = {makeFujitsuPayload, addProntoMetadata, MODE, FANSPEED, SWING}