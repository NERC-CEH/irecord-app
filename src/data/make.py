import sys
import subprocess

sys.path.append('./scripts')

import _clean
import _json_translator

#get file names
if (len(sys.argv) < 4):
	# print(sys.argv)
    # print(''' \nYou must provide the UKSI and warehouse IDs csv files and the output filename to convert to! eg. python make.py UKSI.csv warehouse_ids.csv out\n ''')
    sys.exit()

UKSI_filename = sys.argv[1]
warehouse_filename = sys.argv[2]
output_filename = sys.argv[3]

# Join two tables on NBN key:
print('Joining Warehouse IDs and UKSI...')
subprocess.call('csvjoin -v -c "NBN_TAXON_VERSION_KEY_FOR_RECOMMENDED_NAME,search_code" ' + UKSI_filename + ' ' + warehouse_filename + ' > list_full.csv', shell=True)

# Cut the unneeded columns out:
print('Removing extra columns...')
subprocess.call('csvcut -c "id, INFORMAL_GROUP_ID,RECOMMENDED_SCIENTIFIC_NAME,COMMON_NAME,SYNONYM" list_full.csv | csvformat -U 1 > list.csv', shell=True)

# Clean the data
print('Cleaning species data...')
_clean.run('list.csv')

# Transform list.csv to list.json:
print('Transforming to JSON...')
_json_translator.run('list.csv', output_filename + '.data.json')

# Create common name map
print('Building name map...')
subprocess.call('node --harmony scripts/_makeCommonNameMap.js ../' + output_filename + '.data.json ' + output_filename + '_names.data.json', shell=True)

print('Cleaning up...')
subprocess.call('rm list.csv && rm list_full.csv', shell=True)

print('Done! :)')
