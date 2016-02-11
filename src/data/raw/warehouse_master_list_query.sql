 SELECT "gv_taxa_taxon_lists"."search_code", "gv_taxa_taxon_lists"."id"
 FROM gv_taxa_taxon_lists 
WHERE "taxon_list_id" = '15' AND scientific = true AND preferred = true
ORDER BY "taxon" ASC; 
