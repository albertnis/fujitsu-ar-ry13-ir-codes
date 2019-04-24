function printArray(arr) {
  console.log(`[${arr.join(', ')}]`)
}

function pad(num, size) {
  var s = num + "";
  while (s.length < size) s = "0" + s;
  return s;
}

function base642bytes(base64Utf8String) {
  return [...(Buffer.from(base64Utf8String, 'base64'))]
}

if (require.main === module) {
  process.argv.slice(2).forEach(b64 => {
    var bytes = base642bytes(b64)
    console.log(bytes.length)
    printArray(bytes.map(b => `'${pad(b.toString(16),2)}'`))
    
  })
}

module.exports =  {base642bytes}