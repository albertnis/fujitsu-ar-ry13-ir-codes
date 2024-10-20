import { z } from 'zod'
import type { IrDevice } from '..'
import { addProntoMetadata, makeFujitsuPayload } from '../../fujitsu'

const frequency: number = 39e3
const leader: Uint8Array = new Uint8Array([0x7c, 0x3e])
const trailer: Uint8Array = new Uint8Array([0x10, 0x130])
const oneCode: Uint8Array = new Uint8Array([0x10, 0x2e])
const zeroCode: Uint8Array = new Uint8Array([0x10, 0x10])

export const arRy13StateSchema = z
  .object({ device: z.literal('fujitsu-ar-ry13') })
  .and(
    z.union([
      z.object({
        power: z.literal('off'),
      }),
      z.object({
        power: z.literal('on'),

        mode: z.enum(['auto', 'cool', 'dry', 'fan_only', 'heat']),
        temperatureCelsius: z.enum([
          '16',
          '17',
          '18',
          '19',
          '20',
          '21',
          '22',
          '23',
          '24',
          '25',
          '26',
          '27',
          '28',
          '29',
          '30',
        ]),
        fanSpeed: z.enum(['auto', 'high', 'med', 'low', 'quiet']),
        previousPower: z.enum(['on', 'off']),
        swing: z.enum(['off', 'horizontal', 'vertical', 'both']),
      }),
    ]),
  )

type ArRy13State = z.infer<typeof arRy13StateSchema>

const MODE = {
  auto: 0x0,
  cool: 0x8,
  dry: 0x4,
  fan_only: 0xc,
  heat: 0x2,
}

const FANSPEED = {
  auto: 0x0,
  high: 0x8,
  med: 0x4,
  low: 0xc,
  quiet: 0x2,
}

const SWING = {
  off: 0x0,
  horizontal: 0x4,
  vertical: 0x8,
  both: 0xc,
}

const TEMPERATURE = {
  16: 0x0,
  17: 0x8,
  18: 0x4,
  19: 0xc,
  20: 0x2,
  21: 0xa,
  22: 0x6,
  23: 0xe,
  24: 0x1,
  25: 0x9,
  26: 0x5,
  27: 0xd,
  28: 0x3,
  29: 0xb,
  30: 0x7,
}

const PAYLOAD_OFF = [0x28, 0xc6, 0x00, 0x08, 0x08, 0x40, 0xc0]

export const fujitsuArRy13: IrDevice<ArRy13State> = {
  stateSchema: arRy13StateSchema,
  getProntoCodeForState: (state) => {
    const payload =
      state.power === 'off'
        ? PAYLOAD_OFF
        : makeFujitsuPayload(
            state.temperatureCelsius,
            MODE[state.mode],
            FANSPEED[state.fanSpeed],
            SWING[state.swing],
            state.previousPower === 'on',
          )

    var pronto = addProntoMetadata(
      payload,
      frequency,
      [...leader],
      [...trailer],
      [...oneCode],
      [...zeroCode],
    )

    return pronto
  },
}
