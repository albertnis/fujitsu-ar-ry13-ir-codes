import { fujitsuArRy13 } from './fujitsu/ar-ry13'
import { z, ZodType } from 'zod'

export interface IrDevice<DeviceState> {
  stateSchema: ZodType<DeviceState>
  getProntoCodeForState: (state: DeviceState) => string
}

export const anyDeviceStateSchema = fujitsuArRy13.stateSchema

type DeviceName = z.infer<typeof anyDeviceStateSchema>['device']
export const deviceRegistry: Record<DeviceName, IrDevice<any>> = {
  'fujitsu-ar-ry13': fujitsuArRy13,
}
