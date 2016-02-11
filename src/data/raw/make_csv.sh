#!/bin/bash

#Join two tables on NBN key:
csvjoin -v -c "NBN_TAXON_VERSION_KEY_FOR_RECOMMENDED_NAME,search_code" NHM_master_list.csv warehouse_master_list.csv > master_list_full.csv

#Cut the unneeded columns out:
csvcut -c "id, INFORMAL_GROUP_ID,RECOMMENDED_SCIENTIFIC_NAME,TAXON,SYNONYM" master_list_full.csv > master_list.csv && rm master_list_full.csv 

#Clean the master list from [] and ()
sed 's/\(\[.*\]\s\)\|\((.*)\s\)//g' master_list.csv > master_list_cleaned.csv

#Shorten subsp to ssp
sed 's/subsp\./ssp\./g' master_list_cleaned.csv > master_list.csv && rm master_list_cleaned.csv
