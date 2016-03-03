#!/bin/bash

#Join two tables on NBN key:
csvjoin -v -c "NBN_TAXON_VERSION_KEY_FOR_RECOMMENDED_NAME,search_code" NHM_master_list.csv warehouse_master_list.csv > master_list_full.csv

#Cut the unneeded columns out:
csvcut -c "id, INFORMAL_GROUP_ID,RECOMMENDED_SCIENTIFIC_NAME,COMMON_NAME,SYNONYM" master_list_full.csv > master_list.csv && rm master_list_full.csv 

#Clean the master list from '[]'
sed -i 's/\[.*\]\s//g' master_list.csv

#Remove ',()' - should not start with brackets
sed -i 's/,(.*)/,/g' master_list.csv

#todo: remove non alphanumerics
sed -i "s/[^_0-9,A-Za-z \.\-\=\(\)\']//g" master_list.csv

#remove 'a '
sed -i 's/,a /,/g' master_list.csv

#Capitalize first words after comma
sed -i "s/,\(.\)/,\u\1/g" master_list.csv

#Shorten subsp. to ssp.
sed -i 's/subsp\./ssp\./g' master_list.csv



