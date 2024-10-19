export const makeChecksum = (bytes) => {
  // Take bytes 8-13
  var codes_of_interest = bytes.slice(8, 15)

  // Reverse them
  var codes_reversed = codes_of_interest.map((b) => reverseBits(b))

  // Sum
  var codesSum = codes_reversed.reduce((acc, x, i) => {
    return acc + x
  })

  // Calculate
  var codes_calc = (208 - codesSum).mod(256)

  // Reverse result
  return reverseBits(codes_calc)
}

Number.prototype.mod = function (n) {
  return ((this % n) + n) % n
}

export const reverseBits = (num) => {
  return parseInt(pad(num.toString(2), 8).split('').toReversed().join(''), 2)
}

const pad = (num, size) => {
  var s = num + ''
  while (s.length < size) s = '0' + s
  return s
}
