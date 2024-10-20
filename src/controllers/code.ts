import { z } from 'zod'
import { anyDeviceStateSchema, deviceRegistry } from '../devices'
import { pronto2broadlink } from '../pronto2broadlink'

type Output =
  | {
      status: 'bad_request'
      data: any
    }
  | {
      status: 'ok'
      data: string
    }

const paramsSchema = z
  .object({ format: z.enum(['pronto', 'broadlink']) })
  .and(anyDeviceStateSchema)

export const codeController = (unknownParams: unknown): Output => {
  const paramsParse = paramsSchema.safeParse(unknownParams)

  if (!paramsParse.success) {
    return {
      status: 'bad_request',
      data: paramsParse.error.format(),
    }
  }
  const params = paramsParse.data

  const device = deviceRegistry[params.device]
  const pronto = device.getProntoCodeForState(params)

  return {
    status: 'ok',
    data: params.format === 'broadlink' ? pronto2broadlink(pronto) : pronto,
  }
}
