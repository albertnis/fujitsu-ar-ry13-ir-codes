function makeChecksum(bytes) {
  // Take bytes 8-13
  var codes_of_interest = bytes.slice(8, 15)
  
  // Reverse them
  var codes_reversed = codes_of_interest.map(b => reverseBits(b))
  
  // Sum
  var codesSum = codes_reversed.reduce((acc, x, i) => {
    return acc + x
  })
  
  // Calculate
  var codes_calc = (208 - codesSum).mod(256)
  console.log(codes_calc)
  
  // Reverse result
  return reverseBits(codes_calc)
}

Number.prototype.mod = function(n) {
  return ((this%n)+n)%n
}

function reverseBits(num) {
  return parseInt(pad(num.toString(2), 8).split('').reverse().join(''), 2)
}

function pad(num, size) {
  var s = num + "";
  while (s.length < size) s = "0" + s;
  return s;
}

if (require.main === module) {
  var codes = ['28', 'c6', '00', '08', '08', '7f', '90', '0c', '07', '40', '0c', '00', '00', '00', '04', '79']

  var codesn = codes.map(b => parseInt(b, 16))
  console.log(pad(makeChecksum(codesn).toString(16), 2))
}

module.exports = {reverseBits, makeChecksum}