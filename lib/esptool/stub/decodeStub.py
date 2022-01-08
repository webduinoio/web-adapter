import base64
import zlib

stub = {}
stub['esp8266'] = eval(zlib.decompress(base64.b64decode(b"""
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\
""")))

stub['esp32'] = eval(zlib.decompress(base64.b64decode(b"""
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\
""")))

# print(stub['esp8266'])
print(stub['esp32'])

# for chip in ['esp8266', 'esp32']:
#     for x in ['text', 'data']:
#         f = open(chip + '/' + x + '.stub', 'w+b')
#         f.write(stub[chip][x])
#         f.close
