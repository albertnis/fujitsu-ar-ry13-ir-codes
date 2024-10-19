// CLI to get payload bytes from Broadlink code (for reverse engineering)

const base642bytes = (base64Utf8String) => {
  return [...Buffer.from(base64Utf8String, 'base64')]
}

const trimWaffle = (bytes) => {
  return bytes.slice(6, bytes.length - 6)
}

const normaliseBytes = (bytes, threshold) => {
  return bytes.map((b) => {
    var bNum = parseInt(b, 16)
    return bNum > threshold ? '26' : '0d'
  })
}

const pad = (num, size) => {
  var s = num + ''
  while (s.length < size) s = '0' + s
  return s
}

const printArray = (arr) => {
  console.log(`[${arr.join(', ')}]`)
}

/* Standalone (CLI) usage */
const cliUsage = `Usage:
  Derive payload for sniffed Broadlink code. Used for reverse-engineering.

  bun reconstructPacket.js --help
    Display this usage message
  bun reconstructPacket.js <Broadlink code> [<Broadlink code>] [<Broadlink code>]…
    Display payload bytes for one or more Broadlink codes`

if (import.meta.path === Bun.main) {
  if (Bun.argv.at(-1) === '--help') {
    console.log(cliUsage)
  } else if (Bun.argv.length < 3) {
    console.error('No Broadlink code provided')
    console.log(cliUsage)
    process.exit(1)
  } else {
    Bun.argv.slice(2).forEach((b64) => {
      var bytes = base642bytes(b64)
      bytes = trimWaffle(bytes)
      bytes = normaliseBytes(bytes, 0x15)
      printArray(bytes.map((b) => `'${pad(b.toString(16), 2)}'`))
      console.log(bytes.length)

      for (var rBin = '', i = 0; i < bytes.length; i += 2) {
        if (bytes[i + 1] === '26') {
          rBin += '1'
        } else if (bytes[i + 1] === '0d') {
          rBin += '0'
        }
      }

      console.log(rBin)
      console.log(rBin.length)

      for (var rHex = [], i = 0; i < rBin.length; i += 8) {
        var byte = rBin.substr(i, 8)
        var num = parseInt(byte, 2)
        rHex.push(num)
      }

      printArray(rHex.map((b) => `'${pad(b.toString(16), 2)}'`))
    })
  }
}
