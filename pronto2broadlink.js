// Javascript port of https://gist.githubusercontent.com/appden/42d5272bf128125b019c45bc2ed3311f/raw/bdede927b231933df0c1d6d47dcd140d466d9484/pronto2broadlink.py
// Discovered at https://www.reddit.com/r/homeautomation/comments/7m7ddv/broadlink_ir_database/dru77am/
// More protocol documentation at https://github.com/mjg59/python-broadlink/blob/master/protocol.md
// Run standalone with:
// node pronto2broadlink.js "<pronto code>"

function pronto2lirc(pronto) {
  for (var codes = [], i = 0; i < pronto.length - 1; i += 2) {
    codes.push((pronto[i] << 8) + pronto[i + 1])
  }

  if (codes[0] !== 0) {
    raise('Pronto code should start with 0000')
  }
  if (codes.length !== 4 + 2 * (codes[2] + codes[3])) {
    raise('Number of pulse widths does not match the preamble')
  }

  period = 1 / (codes[1] * 0.241246)
  return codes.slice(4).map(c => {
    return Math.round(c / period)
  })
}

function lirc2broadlink(pulses, repeats) {
  var payload = broadlinkEncodePayload(pulses)

  var lengthBytes = bigEndianToLittleEndian(payload, 2);

  var packet = []
  packet.push(0x26, repeats)
  packet.push(...lengthBytes)
  packet.push(...payload, 0x0d, 0x05)

  remainder = (packet.length + 4) % 16  // rm.send_data() adds 4-byte header (02 00 00 00)
  if (remainder > 0) {
    packet.push(...Array(16 - remainder).fill(0))
  }

  return packet

}

function bigEndianToLittleEndian(payload, nbytes) {
  var lengthHexStrBE = pad(payload.length.toString(16), nbytes * 2); // Big endian (default)
  var lengthHexStrLE = lengthHexStrBE.split().reverse().join(""); // Little endian

  for (var leBytes = [], i = 0; i < lengthHexStrLE.length; i += 2) {
    leBytes.push(parseInt(lengthHexStrLE.substr(i, 2),16))
  }

  return leBytes.reverse();
}

function broadlinkEncodePayload(pulses) {
  for (var payload = [], i = 0; i < pulses.length; i++) {
    var pulse = Math.floor(pulses[i] * 269 / 8192)

    if (pulse < 256) {
      payload.push(pulse)
    } else {
      payload.push(0x00, (pulse & 0xFF00) >> 8, pulse & 0x00FF)
    }
  }

  return payload
}

function b64encode(packet) {
  return Buffer.from(packet).toString('base64')
}

function pad(num, size) {
  var s = num + "";
  while (s.length < size) s = "0" + s;
  return s;
}

function hexToBytes(hexRaw) {
  hex = hexRaw.split(' ').join('')
  for (var bytes = [], c = 0; c < hex.length; c += 2)
    bytes.push(parseInt(hex.substr(c, 2), 16));
  return bytes;
}

function printArray(arr) {
  console.log(`[${arr.join(', ')}]`)
}

if (require.main === module) {
  process.argv.slice(2).forEach(code => {
    pronto = hexToBytes(code)
    console.log('ProntoBytes:')
    printArray(pronto.map(b => `'${b.toString(16)}'`))

    pulses = pronto2lirc(pronto)
    console.log('Pulses:')
    printArray(pulses)

    packet = lirc2broadlink(pulses, 0x00)
    console.log('Packet:')
    printArray(packet.map(b => `'${b.toString(16)}'`))

    var b64Packet = b64encode(packet)
    console.log('Base64 packet:')
    console.log(b64Packet)
  })
}