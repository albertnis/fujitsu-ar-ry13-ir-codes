import {
  makeFujitsuPayload,
  addProntoMetadata,
  MODE,
  FANSPEED,
  SWING,
} from './fujitsu'

import { pronto2broadlink } from './pronto2broadlink'

const server = Bun.serve({
  port: 8080,
  async fetch(req) {
    const { pathname, search } = new URL(req.url)
    const searchParams = Object.fromEntries(new URLSearchParams(search))

    if (pathname === '/broadlink') {
      let { tempC, mode, fanSpeed, swing, powerOn } = searchParams

      var payload = makeFujitsuPayload(
        tempC,
        MODE[mode.toLowerCase()],
        FANSPEED[fanSpeed.toLowerCase()],
        SWING[swing.toLowerCase()],
        powerOn
      )

      var pronto = addProntoMetadata(
        payload,
        39e3,
        [0x7c, 0x3e],
        [0x10, 0x130],
        [0x10, 0x2e],
        [0x10, 0x10]
      )

      var b64 = pronto2broadlink(pronto)

      return new Response(b64, {
        headers: { 'Content-Type': 'text/plain' },
      })
    }

    if (pathname === '/pronto') {
      let { tempC, mode, fanSpeed, swing, powerOn } = searchParams

      var payload = makeFujitsuPayload(
        tempC,
        MODE[mode.toLowerCase()],
        FANSPEED[fanSpeed.toLowerCase()],
        SWING[swing.toLowerCase()],
        powerOn
      )

      var pronto = addProntoMetadata(
        payload,
        39e3,
        [0x7c, 0x3e],
        [0x10, 0x130],
        [0x10, 0x2e],
        [0x10, 0x10]
      )

      return new Response(pronto, {
        headers: { 'Content-Type': 'text/plain' },
      })
    }
  },
})

console.log(`Listening on ${server.url}`)
