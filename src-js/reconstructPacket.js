var base2byte = require('./base642bytes')

function trimWaffle(bytes) {
  return bytes.slice(8, bytes.length - 4)
}

function normaliseBytes(bytes) {
  return bytes.map(b => {
    if (b > 0x30) return 0x35
    if (b > 0x12) return 0x15
    return 0x10
  })
}

function pad(num, size) {
  var s = num + "";
  while (s.length < size) s = "0" + s;
  return s;
}

function printArray(arr) {
  console.log(`[${arr.join(', ')}]`)
}

if (require.main === module) {
  process.argv.slice(2).forEach(b64 => {
    var bytes = base2byte.base642bytes(b64)
    
    bytes = trimWaffle(bytes)
    //printArray(bytes.map(b => `'${pad(b.toString(16),2)}'`))
    //printArray(bytes.map(b => `'${pad(b.toString(16),2)}'`))
    //bytes = normaliseBytes(bytes)
    //console.log(bytes)
    printArray(bytes.map(b => `'${pad(b.toString(16),2)}'`))
    console.log(bytes.length)
    
    for (var rBin = "", i = 0; i < bytes.length; i += 2) {
      if (bytes[i + 1]/bytes[i] > 2) {
        rBin += '1'
      } else {
        rBin += '0'
      }
    }

    //console.log(rBin)
    //console.log(rBin.length)
    
    for (var rHex = [], i = 0; i < rBin.length; i += 8) {
      var byte = rBin.substr(i, 8)
      var num = parseInt(byte, 2)
      rHex.push(num)
    }
    
    printArray(rHex.map(b => `'${pad(b.toString(16),2)}'`))
    
  })
}