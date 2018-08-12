-- CHANGE taxon_list_id to match the list

-- Get all english taxon names (taxa_taxon_list + taxa)
WITH joined AS (
	SELECT * FROM indicia.taxa_taxon_lists as ttl 
	JOIN indicia.taxa as ta
	ON ta.id = ttl.taxon_id and ta.language_id = 1 
	WHERE ttl."taxon_list_id" = 15 and ta.deleted = false
),
-- Get only unique taxon groups
unique_taxon_groups AS (
	SELECT (array_agg(id))[1] as id, title 
	FROM indicia.taxon_groups
	WHERE deleted = false
	GROUP BY title
),

-- Main
main AS (
	SELECT preferred_taxa_taxon_list_id as id, tg.id as taxon_group, replace(preferred_taxon, '[unassigned] ', '') as taxon, default_common_name as common_name, (array_agg(joined.taxon))[1] as synonym

	-- get preferred_taxon and default_common_name from cacheed taxon terms
	FROM indicia.cache_taxon_searchterms as t 

	-- we need to add synonyms
	LEFT JOIN joined ON t.taxon_meaning_id = joined.taxon_meaning_id and default_common_name != joined.taxon -- get synonyms that match taxon_meaning_id
	LEFT JOIN unique_taxon_groups as tg on t.taxon_group = tg.title
	WHERE t."taxon_list_id" = 15
	AND t.simplified = false
	AND t.preferred = true 
	AND t.name_type = 'L' 

	-- there are multiple synonyms and other stuff for each latin taxa so we need to aggregate
	GROUP BY t.id, tg.id, preferred_taxon, default_common_name 
	ORDER by "preferred_taxon" ASC 
)

-- uncomment for main list 
SELECT * FROM main;

-- uncomment for taxon group list 
--SELECT id, regexp_replace(regexp_replace(title, '\(.*\)|insect - |terrestrial ', '', 'g'), 'flowering', 'flower.', 'g') FROM taxon_groups WHERE taxon_groups.id IN (SELECT taxon_group FROM main ) 