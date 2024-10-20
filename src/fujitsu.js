import { makeChecksum } from './makeChecksum'

const TEMPERATURE = {
  16: 0x0,
  17: 0x8,
  18: 0x4,
  19: 0xc,
  20: 0x2,
  21: 0xa,
  22: 0x6,
  23: 0xe,
  24: 0x1,
  25: 0x9,
  26: 0x5,
  27: 0xd,
  28: 0x3,
  29: 0xb,
  30: 0x7,
}

const makePowerCode = (powerOn) => (powerOn > 0 ? 0x8 : 0x0)

const makeTemperatureCode = (tempC) => {
  // Clip between 16 and 30
  var temp = Math.round(tempC)
  temp = tempC > 30 ? 30 : tempC
  temp = tempC < 16 ? 16 : tempC
  return TEMPERATURE[temp]
}

const concatBytes = (a, b) => {
  return (a << 4) + b
}

export const makeFujitsuPayload = (
  tempC,
  mode,
  fanSpeed,
  swingMode,
  powerOn,
) => {
  // [1-8] Codes M1, M2, P, C1, C2, D, U1, U2
  var payload = [0x28, 0xc6, 0x00, 0x08, 0x08, 0x7f, 0x90, 0x0c]

  // [9] On/off + Temp
  payload = [
    ...payload,
    concatBytes(makePowerCode(powerOn), makeTemperatureCode(tempC)),
  ]

  // [10] Master mode + Timer mode
  payload = [...payload, concatBytes(mode, 0x0)]

  // [11] Fan speed + Swing mode
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
  payload = [...payload, makeChecksum(payload)]

  return payload
}

const pad = (num, size) => {
  var s = num + ''
  while (s.length < size) s = '0' + s
  return s
}

export const addProntoMetadata = (
  payload,
  frequency,
  leaderPair,
  trailerPair,
  onePair,
  zeroPair,
) => {
  for (var payloadBinary = '', i = 0; i < payload.length; i++) {
    payloadBinary += pad(payload[i].toString(2), 8)
  }

  var oneHex = pad(onePair[0].toString(16), 4) + pad(onePair[1].toString(16), 4)
  var zeroHex =
    pad(zeroPair[0].toString(16), 4) + pad(zeroPair[1].toString(16), 4)
  for (var prontoHex = '', i = 0; i < payloadBinary.length; i++) {
    if (payloadBinary[i] === '1') {
      prontoHex += oneHex
    } else if (payloadBinary[i] === '0') {
      prontoHex += zeroHex
    }
  }

  var leaderHex =
    pad(leaderPair[0].toString(16), 4) + pad(leaderPair[1].toString(16), 4)
  var trailerHex =
    pad(trailerPair[0].toString(16), 4) + pad(trailerPair[1].toString(16), 4)

  prontoHex = leaderHex + prontoHex + trailerHex

  var burstLength = prontoHex.length / 8
  var burstLengthHex = pad(burstLength.toString(16), 4)

  var freqConv = Math.round(1e6 / (frequency * 0.241246))
  var freqConvHex = pad(freqConv.toString(16), 4)

  prontoHex = '0000' + freqConvHex + '0000' + burstLengthHex + prontoHex

  return prontoHex
}
