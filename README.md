# Stateful IR codes sandbox

Generate codes based on device state which can be sent to an IR blaster in order to emulate the manufacturer's infrared remote.

Rather than simply being a "database of IR codes" which are already prevalent on the web, this repo focuses on devices like heat pumps whose remotes send more complicated payloads which depend on state and cannot necessarily be replayed.

Codes can be generated in pronto or BroadLink formats.

## Devices

The repo is structured to support many devices. Each device definition is represented by a directory which contains three items:

- In `index.ts`:
  - A zod schema representing the state which is used to build a code (effectively, the state which would normally be retained by the manufacturer's remote)
  - A function which takes in a desired state and outputs a pronto code
- In `README.md`
  - A device-specific README describing any reverse-engineering notes or caveats

For convenience, here is a list of supported devices:

### Fujitsu

- [AR-RY13 heat pump](./src/devices/fujitsu/ar-ry13/README.md)

## How to use

Usage is via an HTTP API. Install dependencies then run the API server:

<table>
<tr>
  <th>Step</th>
  <th>Local bun</th>
  <th>Docker</th>
</tr>
<tr>
<td>1. Setup</td>
<td>

```bash
bun install
```

</td>
<td>

```bash
docker build -t ir-codes .
```

</td>
</tr>
<tr>
<td>2. Run</td>
<td>

```bash
bun start
```

</td>
<td>

```bash
docker run -it -p 8080:8080 --rm ir-codes
```

</td>
</tr>
</table>

### API contract

Send the state as query parameters to the `GET /code` endpoint. All requests must have the following two parameters:

- `format` set to either `broadlink` or `pronto`. This determines the output format. BroadLink codes will be base64-encoded while pronto codes are hex-encoded, as is typical for each format.
- `device` set to the device code. This can be found in the schema for that device.

The remaining parameters must match the device-specific schema. For example, a valid request for the Fujitsu AR-RY13 heat pump might look like:

```bash
http://localhost:8080/code?format=broadlink=device=fujitsu-ar-ry13&temperatureCelsius=18&mode=heat&fanSpeed=quiet&swing=off&previousPower=off&power=on
```
