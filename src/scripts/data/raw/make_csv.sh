#!/bin/bash

#Join two tables on NBN key:
csvjoin -v -c "NBN_TAXON_VERSION_KEY_FOR_RECOMMENDED_NAME,search_code" NHM_master_list.csv warehouse_master_list_dev.csv > master_list_full.csv

#Cut the unneeded columns out:
csvcut -c "id, INFORMAL_GROUP_ID,RECOMMENDED_SCIENTIFIC_NAME,COMMON_NAME,SYNONYM" master_list_full.csv | csvformat -U 1 > master_list.csv && rm master_list_full.csv 

#Clean the master list from '[]'
sed -i 's/\[.*\]\s//g' master_list.csv

#Remove ',()' - should not start with brackets
sed -i 's/,(.*)/,/g' master_list.csv

#Remove ',.*().*,,' - should not have bracketed old Genus
sed -i 's/\(\"[0-9]*\",\"[0-9]*\",.*\)\s(.*)\(.*,.*,.*\)/\1\2/g' master_list.csv
#Twice to remove ssp. brackets
sed -i 's/\(\"[0-9]*\",\"[0-9]*\",.*\)\s(.*)\(.*,.*,.*\)/\1\2/g' master_list.csv

#todo: remove non alphanumerics
sed -i "s/[^-_0-9,A-Za-z \.\=\(\)\'\"]//g" master_list.csv

#remove 'a '
sed -i 's/,a /,/g' master_list.csv

#remove trailing and double spaces
sed -i 's/ \"/"/g' master_list.csv
sed -i 's/  / /g' master_list.csv

#sensu stricto -> s.s.
# sensu stricto
# sens.strict.
# sens.str.
# s.str.
# s. str.
# s.s.
# sens. str.
sed -i 's/\(\(sensu stricto\)\|\(sens\.strict\.\)\|\(sens\.str\.\)\|\(s\.str\.\)\|\(s\. str\.\)\|\(sens\. str\.\)\)/s.s./g' master_list.csv

#sensu lato -> s.l.
# sensu lato
# sensu.lato.
# s. lat.
# sens. lat.
# s.lat.
# s. lat.
# s.l.
# sens.lat.
sed -i 's/\(\(sensu lato\)\|\(Sensu lato\)\|\(sensu\.lato\.\)\|\(s\. lat\.\)\|\(sens\. lat\.\)\|\(s\.lat\.\)\|\(s\. lat\.\)\|\(sens\.lat\.\)\)/s.l./g' master_list.csv

#sensu -> s.
sed -i 's/ sensu / s. /g' master_list.csv

#nomen -> nom.
sed -i 's/ nomen / nom. /g' master_list.csv

#misidentification -> misid.
sed -i 's/ misidentification/ misid./g' master_list.csv
sed -i 's/ misident./ misid./g' master_list.csv

#authors -> auth.
sed -i 's/ authors/ auth./g' master_list.csv

#Capitalize first words after comma
sed -i "s/,\(.\)/,\u\1/g" master_list.csv

#Shorten subsp. to ssp.
sed -i 's/subsp\./ssp\./g' master_list.csv