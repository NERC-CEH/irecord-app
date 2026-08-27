# Species survey configs

`index.tsx` contains the base survey and registers the taxon-specific configs in `taxonGroupSurveys`.

`survey.get(sample)` reads the first occurrence's taxon group, selects the matching config (highest `taxaPriority` wins), and merges it over the base config. If nothing matches, the base config is used.

For list sub-samples, the parent survey's `smp` config is merged in last so list-specific behaviour is preserved.
