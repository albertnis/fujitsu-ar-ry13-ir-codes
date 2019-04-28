## Broadlink spec for AD18

Preamble: '26', '00', '48', '00'
Leader: '00', '01', '2a', '91'
       = 0x12a, 0x91
Payload encoded as timing
Trailer: '15', '00'
Postamble: '0d', '05'

Zero bit: '15','10'
One bit: '15', '35'

## Payload spec

Payloads look like the following:

[0x48, 0x2c, 0x**H**0, 0x**L**f]

Where **H** is the high nibble of the command code and **L** is the low nibble. Codes on the remote control are below.

| Function     | Code (hex) | Code (dec) | Code/15 (dec)
| ---          | ---        | ---        | ---
| Toggle power | 87         | 135        | 9
| Mute         | 96         | 150        | 10
| Center       | 2d         | 45         | 3
| Up           | 4b         | 75         | 5
| Down         | 69         | 105        | 7
| Left         | c3         | 195        | 13
| Right        | a5         | 165        | 11
| Next input   | e1         | 225        | 15
| Fn           | 1e         | 30         | 2

Mysteriously, the codes are multiples of 15. Which multiples are missing from the remote?

### Missing codes

Missing codes were used to craft packets which were sent to the AD18.

| Code/15 (dec) | Function
| --- | ---
| 0 | noop
| 1 | noop
| 4 | noop
| 6 | noop
| 8 | noop
| 12 | noop
| 14 | noop
| 16 | noop
| 17 | noop

That's disappointing. Not one of the missing codes actually does anything. There's a chance there are hidden codes which change other bytes or use other patterns, but for now this case is closed.