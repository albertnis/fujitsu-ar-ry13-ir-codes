# Python 3 port of https://gist.githubusercontent.com/appden/42d5272bf128125b019c45bc2ed3311f/raw/bdede927b231933df0c1d6d47dcd140d466d9484/pronto2broadlink.py
# Discovered at https://www.reddit.com/r/homeautomation/comments/7m7ddv/broadlink_ir_database/dru77am/
# More protocol documentation at https://github.com/mjg59/python-broadlink/blob/master/protocol.md
# Run standalone with:
# python pronto2broadlink.py "<pronto code>"

import struct
import binascii
import hexdump as hexd
from base64 import b64encode

def pronto2lirc(pronto):
    codes = [int(binascii.hexlify(pronto[i:i+2]), 16) for i in range(0, len(pronto), 2)]

    if codes[0]:
        raise ValueError('Pronto code should start with 0000')
    if len(codes) != 4 + 2 * (codes[2] + codes[3]):
        raise ValueError('Number of pulse widths does not match the preamble')

    frequency = 1 / (codes[1] * 0.241246)
    return [int(round(code / frequency)) for code in codes[4:]]

def lirc2broadlink(pulses):
    array = bytearray()

    for pulse in pulses:
        pulse = (int)(pulse * 269 / 8192)  # Pulse lengths in 2^-15s units

        if pulse < 256:
            array += bytearray(struct.pack('>B', pulse))  # big endian (1-byte)
        else:
            array += bytearray([0x00])  # indicate next number is 2-bytes
            array += bytearray(struct.pack('>H', pulse))  # big endian (2-bytes)
    print(len(array))
    packet = bytearray([0x26, 0x01])  # 0x26 = IR, 0x00 = no repeats
    packet += bytearray(struct.pack('<H', len(array)))  # little endian byte count
    packet += array
    packet += bytearray([0x0d, 0x05])  # IR terminator

    # Add 0s to make ultimate packet size a multiple of 16 for 128-bit AES encryption.
    remainder = (len(packet) + 4) % 16  # rm.send_data() adds 4-byte header (02 00 00 00)
    print(len(packet))
    if remainder:
        packet += bytearray(16 - remainder)

    return packet

if __name__ == '__main__':
    import sys

    for code in sys.argv[1:]:
        pronto = bytearray.fromhex(code)
        print('ProntoBytes:')
        print(pronto)
        print([hex(p)[2:] for p in pronto])

        pulses = pronto2lirc(pronto)
        print('Pulses:')
        print(pulses)

        packet = lirc2broadlink(pulses)
        print('Packet:')
        print(packet)
        print([hex(p)[2:] for p in packet])

        print('Hex packet:')
        hexPacket = hexd.dump(packet)

        b64Packet = b64encode(packet)
        print('Base64 packet:')
        print(b64Packet.decode('utf-8'))