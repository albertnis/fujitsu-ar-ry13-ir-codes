

Abrams' document has zero bit swapped with one bit. In reality one bit is 0010 002E and zero bit is 0010 0010.

### Words 1-8: Markers/unknown
0x28
0xc6
0x00
0x08
0x08
0x7f
0x90
0x0c

### Word 9: State + temp
State: 0x0 already on
Temp: 0x0 16degC, 0x4 18degC, 0x7 30degC

### Word 10: Master mode + timer mode
Master mode: 0x0 auto, 0x2 heat, 0x4 dry, 0xc fan, 0x8 cool
Timer mode: 0x0 off

### Word 11: Fan + swing
Fan: 0x0 auto, 0x2 quiet, 0x8 high
Swing: 0x0 none, 0x2 both

## Words 12-14: Timer settings
0x00
0x00
0x00

## Word 15: Unknown
0x04

### Word 16: Checksum
As per [here][checksum-info] but bytes 8 - 14. That is bytes[8:15].


[checksum-info]: https://stackoverflow.com/questions/48531654/fujitsu-ir-remote-checksum-calculation
[broadlink-info]: https://github.com/mjg59/python-broadlink/blob/master/protocol.md#sending-data
[pronto-info]: http://www.remotecentral.com/features/irdisp1.htm
[fujitsu-reverse]: http://files.remotecentral.com/library/21-1/fujitsu/air_conditioner/index.html 