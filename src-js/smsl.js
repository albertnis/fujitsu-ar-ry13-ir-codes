var p2b = require('./pronto2broadlink') 

function encodePayload(bytes, zeroPair, onePair) {
  for (var bin = '', i = 0; i < bytes.length; i++) {
    let byteBin = pad(bytes[i].toString(2), 8)
    bin += byteBin
  }

  console.log(bin.length)

  for (var tBytes = [], i = 0; i < bin.length; i++) {
    if (bin[i] == '0') {
      tBytes.push(...zeroPair)
    }
    else {
      tBytes.push(...onePair)
    }
  }

  return tBytes
}

function pad(num, size) {
  var s = num + "";
  while (s.length < size) s = "0" + s;
  return s;
}

function printArray(arr) {
  console.log(`[${arr.join(', ')}]`)
}

const preamble = [0x26, 0x00, 0x48, 0x00]
const leader = [0x00, 0x01, 0x2a, 0x91]
const trailer = [0x15, 0x00]
const postamble = [0x0d, 0x05]

if (require.main === module) {
  process.argv.slice(2).forEach(codeId => {
    let code = pad((codeId * 15).toString(16), 2)
    let payload = [0x48, 0x2c, parseInt(code[0]+'0',16), parseInt(code[1]+'f',16)]
    let encPayload = encodePayload(payload, [0x15, 0x10], [0x15, 0x35])
    console.log(payload)

    let packet = [...preamble, ...leader, ...encPayload, ...trailer, ...postamble]
    printArray(packet.map(b => `'${pad(b.toString(16),2)}'`))
    console.log(packet.length)

    console.log(p2b.b64encode(packet))
  })
}