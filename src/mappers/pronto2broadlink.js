// Javascript port of https://gist.githubusercontent.com/appden/42d5272bf128125b019c45bc2ed3311f/raw/bdede927b231933df0c1d6d47dcd140d466d9484/pronto2broadlink.py
// Discovered at https://www.reddit.com/r/homeautomation/comments/7m7ddv/broadlink_ir_database/dru77am/
// More protocol documentation at https://github.com/mjg59/python-broadlink/blob/master/protocol.md
// Run standalone with:
// bun pronto2broadlink.js <pronto code>

const pronto2lirc = (pronto) => {
  for (var codes = [], i = 0; i < pronto.length - 1; i += 2) {
    codes.push((pronto[i] << 8) + pronto[i + 1])
  }

  if (codes[0] !== 0) {
    throw new Error('Pronto code should start with 0000')
  }
  if (codes.length !== 4 + 2 * (codes[2] + codes[3])) {
    throw new Error('Number of pulse widths does not match the preamble')
  }

  const period = 1 / (codes[1] * 0.241246)
  return codes.slice(4).map((c) => {
    return Math.round(c / period)
  })
}

const lirc2broadlink = (pulses, repeats) => {
  var payload = broadlinkEncodePayload(pulses)

  var lengthBytes = bigEndianToLittleEndian(payload.length + 2, 2)

  var packet = []
  packet.push(0x26, repeats)
  packet.push(...lengthBytes)
  packet.push(...payload, 0x0d, 0x05)

  const remainder = (packet.length + 4) % 16 // rm.send_data() adds 4-byte header (02 00 00 00)
  if (remainder > 0) {
    packet.push(...Array(16 - remainder).fill(0))
  }

  return packet
}

const bigEndianToLittleEndian = (payloadLength, nbytes) => {
  var lengthHexStrBE = pad(payloadLength.toString(16), nbytes * 2) // Big endian (default)
  var lengthHexStrLE = lengthHexStrBE.split().reverse().join('') // Little endian

  for (var leBytes = [], i = 0; i < lengthHexStrLE.length; i += 2) {
    leBytes.push(parseInt(lengthHexStrLE.substr(i, 2), 16))
  }

  return leBytes.reverse()
}

const broadlinkEncodePayload = (pulses) => {
  for (var payload = [], i = 0; i < pulses.length; i++) {
    var pulse = Math.floor((pulses[i] * 269) / 8192)

    if (pulse < 256) {
      payload.push(pulse)
    } else {
      payload.push(0x00, (pulse & 0xff00) >> 8, pulse & 0x00ff)
    }
  }

  return payload
}

const b64encode = (packet) => {
  return Buffer.from(packet).toString('base64')
}

const pad = (num, size) => {
  var s = num + ''
  while (s.length < size) s = '0' + s
  return s
}

const hexToBytes = (hexRaw) => {
  const hex = hexRaw.split(' ').join('')
  for (var bytes = [], c = 0; c < hex.length; c += 2)
    bytes.push(parseInt(hex.substr(c, 2), 16))
  return bytes
}

export const pronto2broadlink = (prontoStr) => {
  const pronto = hexToBytes(prontoStr)
  const pulses = pronto2lirc(pronto)
  const packet = lirc2broadlink(pulses, 0x00)
  return b64encode(packet)
}

/* Standalone (CLI) usage */
const cliUsage = `Usage:
  bun pronto2broadlink.js --help
    Display this usage message
  bun pronto2broadlink.js <pronto code>
    Convert hex-encoded pronto code to base64-encoded Broadlink code`

if (import.meta.path === Bun.main) {
  const lastArg = Bun.argv.at(-1)

  if (!lastArg || import.meta.path.includes(lastArg)) {
    console.error('No pronto code provided')
    console.log(cliUsage)
    process.exit(1)
  } else if (lastArg === '--help') {
    console.log(cliUsage)
  } else {
    console.log(pronto2broadlink(lastArg))
  }
}
