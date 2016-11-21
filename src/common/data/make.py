import sys
import subprocess

sys.path.append('./scripts')

import _json_translator
import _clean

#get file names
if (len(sys.argv) < 2):
    sys.exit()

filename = sys.argv[1]

# Clean the data
print('Cleaning species data...')
_clean.run(filename + '_cleaned.csv')

# Transform species.csv to json:
print('Transforming to JSON...')
_json_translator.run(filename + '_cleaned.csv', filename + '.data.json')

# Create common name map
print('Building name map...')
subprocess.call('node --harmony scripts/_makeCommonNameMap.js ../' + filename + '.data.json ' + filename + '_names.data.json', shell=True)

print('Done! :)')
