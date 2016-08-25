 SELECT search_code, id
 FROM gv_taxa_taxon_lists as ttl
WHERE taxon_list_id = 15 AND scientific = true AND preferred = true
ORDER BY "taxon" ASC;