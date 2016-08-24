Create master_list.csv
----------------------
1. Get NHM master species list as UKSI.csv in data folder
Run main query in UKSI.accdb

2. Get Warehouse IDs as warehouse_ids.csv in data folder
run warehouse_ids.sql

3. Create master_list.data.json and names_master_list.data.json
run 'python scripts/make.py raw/UKSI.csv raw/warehouse_ids.csv master_list.data'


