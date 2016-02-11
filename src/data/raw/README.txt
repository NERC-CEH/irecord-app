1. Get NHM master species list as NHM_master_list.csv
Run main query in NHM_master_list_05-01-16.accdb

1.1 Clean the NHM_master_list.csv from bracketed naming alternatives eg. 'Nabis (Nabis) ferus' and few first rows starting with 'a' eg. 'a click beetle'

2. Get Warehouse master species list as Warehouse_master_list.csv:
run Warehouse_master_list_query.sql

3. Create master_list.csv
run make_csv.sh

4. Transform Master_list.csv to Master_list.json:
run json_translator.py

