1. Get NHM master species list as NHM_master_list.csv
Run main query in NHM_master_list.accdb

2. Get Warehouse master species list as Warehouse_master_list.csv:
run Warehouse_master_list_query.sql

3. Create master_list.csv
run make_csv.sh

4. Transform Master_list.csv to Master_list.json:
run json_translator.py

