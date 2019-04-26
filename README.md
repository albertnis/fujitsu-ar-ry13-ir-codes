
# AR-RY13 sandbox

Tools for generating AR-RY13 packets for Fujitsu heatpumps and for conversion from pronto to Broadlink packets. Code is written in Python 3 and also ported to JavaScript.

## Running the code

1. Start the server.

    ```sh
    npm start
    ```

2. Hit the controller for either pronto or broadlink formats.

    ```sh
    curl "http://localhost:8080/pronto?tempC=18&mode=heat&fanSpeed=Quiet&swing=Off&powerOn=0"
    ```
    ```sh
    curl "http://localhost:8080/broadlink?tempC=18&mode=heat&fanSpeed=Quiet&swing=Off&powerOn=0"
    ```

# Fujitsu AR-RY13 protocol

None of this would be possible without a document created by David Abrams which reverse-engineers the very similar AR-RY16 remote control. It's great stuff and you should check it out at [Remote Central][fujitsu-reverse].

Frequency: 39kHz (period 25.6μs) (pronto `006a`)

| Data bit | n cycles on | ...then n cycles off | Pronto
| --- | --- | --- | --- |
| 0 | 16 (0x10) | 16 (0x10) | `0010 0010` |
| 1 | 16 (0x10) | 46 (0x2e) | `0010 002e` |
| Leader | 125 (0x7c) | 62 (0x3e) | `007c 003e` |
| Trailer | 16 (0x10) | 305 (0x130) | `0010 0130` |

*NB: The 0 and 1 bits are swapped from what Abrams said, but they certainly work for me. I'm not sure why they are the other way round.*

A pronto packet consists of the following data:

**Pronto preamble + Leader + Payload + Trailer**

- **Pronto preamble**: Four words declaring frequency and payload length. I've declared the length in the fourth word but it could/should probably be in the third as it is non-repeating. Usually will look something like `0000 006a 0000 0082` but make sure it reflects the true payload length.
- **Leader**: As table above `007c 003e`.
- **Payload**: An [off payload](#off-payload) (7 bytes) or a [set vane payload](#set-vane-payload) (7 bytes) or a [state payload](#state-payload) (16 bytes). Encoded using the bit mappings in the table above.
- **Trailer**: As table above `0010 0130`.

Remote central has a [great write-up][pronto-info] on pronto codes if you're interested in learning more.

This code also contains utilities for converting to the Broadlink protocol as I'm using an [RM mini 3][rm-mini]. A really good guide from mjg59 on Github can be found [here][broadlink-info]. The conversion code is ported from a [thread][p2b] I found on Reddit.

## Off payload

Off payload is as per Abrams' document.

| Byte number | Contents |
| ---: | --- |
| 1  |  0x28 |
| 2  |  0xc6 |
| 3  |  0x00 |
| 4  |  0x08 |
| 5  |  0x08 |
| 6  |  0x40 |
| 7  |  0xc0 |

## Set vane payload

There are a couple of payloads specified in Abrams' document. I haven't tested them yet so I won't put them here. But there's a high chance they will work.

## State payload

Shown with example payloads for the unit in heat mode at 21degC, quiet fan, timer off, no swing, power already on.

| Byte number | Contents |
| ---: | --- |
| 1  | Constant 0x28 |
| 2  | Constant 0xc6 |
| 3  | Constant 0x00 |
| 4  | Constant 0x08 |
| 5  | Constant 0x08 |
| 6  | Constant 0x7f |
| 7  | Constant 0x90 |
| 8  | Constant 0x0c |
| 9  | [State, Temperature](#byte-9-state-temp) |
| 10 | [Master mode, Timer mode](#byte-10-master-mode-timer-mode) |
| 11 | [Fan mode, Swing mode](#byte-11-fan-swing) |
| 12 | Timer setting (0x00)* |
| 13 | Timer setting (0x00)* |
| 14 | Timer setting (0x00)* |
| 15 | Constant 0x04 |
| 16 | [Checksum](#byte-16-checksum) |

**NB: I personally don't care about timer settings so haven't worked these codes out. 0x00 works fine for timer disabled.*

### Byte 9: State, temp

| Nibble 1 | State |
| --- | --- |
| 0x0 | Heatpump currently on |
| 0x8 | Heatpump currently off (turn it on) |

| Nibble 2 | Temperature (°C) |
| --- | --- |
| 0x0 | 16 |
| 0x8 | 17 |
| 0x4 | 18 |
| 0xc | 19 |
| 0x2 | 20 |
| 0xa | 21 |
| 0x6 | 22 |
| 0xe | 23 |
| 0x1 | 24 |
| 0x9 | 25 |
| 0x5 | 26 |
| 0xd | 27 |
| 0x3 | 28 |
| 0xb | 29 |
| 0x7 | 30 |

*NB: I have no idea how this would change for farenheit settings.*

> Example: If byte 9 is **0x8c**, that means the heatpump is being newly turned on to a temperature of 19°C

### Byte 10: Master mode, timer mode
| Nibble 1 | Master mode |
| --- | --- |
| 0x0 | auto |
| 0x8 | cool |
| 0x4 | dry |
| 0xc | fan_only |
| 0x2 | heat |

| Nibble 2 | Timer mode |
| --- | --- |
| 0x0 | off |

*NB: there are more timer modes but I'm not interested in this feature so haven't worked them out.*

> Example: If byte 10 is **0x20**, that means the heatpump will be in heat mode with no timer enabled.

### Byte 11: Fan, swing
| Nibble 1 | Fan mode |
| --- | --- |
| 0x0 | auto |
| 0x8 | high |
| 0x4 | med |
| 0xc | low |
| 0x2 | quiet |

| Nibble 2 | Swing mode |
| --- | --- |
| 0x0 | off  |
| 0x4 | horizontal |
| 0x8 | vertical |
| 0xc | both |

> Example: If byte 11 is **0x28**, that means the heatpump is in quiet fan mode with vertical oscillation.

### Byte 16: Checksum
There's a really good explanation [here][checksum-info]. AR-RY13 is the same, **but with bytes 9 - 15**. That is, `bytes[8:15]`. Basically the calculation is as follows:

> 1. Reverse each of bytes 9 - 15 (e.g. 11100001 -> 10000111 for a single byte)
> 2. Sum those reversed bytes
> 3. Take result of (208 - sum) % 256
> 4. Reverse bytes of result

[checksum-info]: https://stackoverflow.com/a/48533869
[broadlink-info]: https://github.com/mjg59/python-broadlink/blob/master/protocol.md#sending-data
[pronto-info]: http://www.remotecentral.com/features/irdisp1.htm
[fujitsu-reverse]: http://files.remotecentral.com/library/21-1/fujitsu/air_conditioner/index.html 
[rm-mini]: http://www.ibroadlink.com/rmMini3/
[p2b]: https://www.reddit.com/r/homeautomation/comments/7m7ddv/broadlink_ir_database/dru77am/

## Example

### State

Heat mode, 22°C, quiet fan, timer off, no swing. Power is already on (this is not a power-on command)

### Bytes

| Byte | Value | Description
| ---: | --- | --- |
| 1  | 0x28 | Constant
| 2  | 0xc6 | Constant
| 3  | 0x00 | Constant
| 4  | 0x08 | Constant
| 5  | 0x08 | Constant
| 6  | 0x7f | Constant
| 7  | 0x90 | Constant
| 8  | 0x0c | Constant
| 9  | 0x06 | Power already on, temperature 22°C
| 10 | 0x20 | Heat mode, timer off
| 11 | 0x20 | Quiet fan, no swing
| 12 | 0x00 | Timer setting (unknown)
| 13 | 0x00 | Timer setting (unknown)
| 14 | 0x00 | Timer setting (unknown)
| 15 | 0x04 | Constant
| 16 | 0x12 | Checksum

So bytes are `['28', 'c6', '00', '08', '08', '7f', '90', '0c', '06', '20', '20', '00', '00', '00', '04', '12']`

### Pronto

```
0000 006a 0000 0082 007c 003e 0010 0010 0010 0010 0010 002e 0010 0010 0010 002e 0010 0010 0010 0010 0010 0010 0010 002e 0010 002e 0010 0010 0010 0010 0010 0010 0010 002e 0010 002e 0010 0010 0010 0010 0010 0010 0010 0010 0010 0010 0010 0010 0010 0010 0010 0010 0010 0010 0010 0010 0010 0010 0010 0010 0010 0010 0010 002e 0010 0010 0010 0010 0010 0010 0010 0010 0010 0010 0010 0010 0010 0010 0010 002e 0010 0010 0010 0010 0010 0010 0010 0010 0010 002e 0010 002e 0010 002e 0010 002e 0010 002e 0010 002e 0010 002e 0010 002e 0010 0010 0010 0010 0010 002e 0010 0010 0010 0010 0010 0010 0010 0010 0010 0010 0010 0010 0010 0010 0010 0010 0010 002e 0010 002e 0010 0010 0010 0010 0010 0010 0010 0010 0010 0010 0010 0010 0010 0010 0010 002e 0010 002e 0010 0010 0010 0010 0010 0010 0010 002e 0010 0010 0010 0010 0010 0010 0010 0010 0010 0010 0010 0010 0010 0010 0010 002e 0010 0010 0010 0010 0010 0010 0010 0010 0010 0010 0010 0010 0010 0010 0010 0010 0010 0010 0010 0010 0010 0010 0010 0010 0010 0010 0010 0010 0010 0010 0010 0010 0010 0010 0010 0010 0010 0010 0010 0010 0010 0010 0010 0010 0010 0010 0010 0010 0010 0010 0010 0010 0010 0010 0010 0010 0010 0010 0010 0010 0010 0010 0010 0010 0010 0010 0010 0010 0010 002e 0010 0010 0010 0010 0010 0010 0010 0010 0010 0010 0010 002e 0010 0010 0010 0010 0010 002e 0010 0010 0010 0130
```

### Broadlink (base64)

```
JgAGAWg0DQ0NDQ0mDQ0NJg0NDQ0NDQ0mDSYNDQ0NDQ0NJg0mDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NJg0NDQ0NDQ0NDQ0NDQ0NDSYNDQ0NDQ0NDQ0mDSYNJg0mDSYNJg0mDSYNDQ0NDSYNDQ0NDQ0NDQ0NDQ0NDQ0NDSYNJg0NDQ0NDQ0NDQ0NDQ0NDSYNJg0NDQ0NDQ0mDQ0NDQ0NDQ0NDQ0NDQ0NJg0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDSYNDQ0NDQ0NDQ0NDSYNDQ0NDSYNDQ3/DQUAAA==
```