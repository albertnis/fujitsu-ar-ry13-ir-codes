function printArray(arr) {
  console.log(`[${arr.join(', ')}]`)
}

function pad(num, size) {
  var s = num + "";
  while (s.length < size) s = "0" + s;
  return s;
}

if (require.main === module) {
  process.argv.slice(2).forEach(b64 => {
    var bytes = [...(Buffer.from(b64, 'base64'))]
    printArray(bytes.map(b => pad(b.toString(16),2)))
    
  })
}