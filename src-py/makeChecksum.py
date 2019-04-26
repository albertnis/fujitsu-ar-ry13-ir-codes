codes = ['28', 'c6', '00', '08', '08', '7f', '90', '0c', '07', '40', '0c', '00', '00', '00', '04', '79']
codesn = [int(c, 16) for c in codes]

# Take bytes 8-13
codes_of_interest = codesn[8:15]

# Reverse them
codes_reversed = [int('{:08b}'.format(n)[::-1], 2) for n in codes_of_interest]

# Sum
codes_sum = sum(codes_reversed)

# Calculate
codes_calc = (208 - codes_sum) % 256
print(codes_calc)

# Reverse result
codes_calc_rev = int('{:08b}'.format(codes_calc)[::-1], 2)

# to hex
checksum = hex(codes_calc_rev)

print(checksum)