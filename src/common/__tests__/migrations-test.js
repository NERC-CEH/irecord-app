import {
  getSampleTaxa,
  migrateLocationTree,
  migrateOldPlantFungiAbundanceAttrs,
} from 'common/migrations';

it('gets taxa from the taxon group with a legacy metadata fallback', () => {
  const sample = {
    occurrences: [{ data: { taxon: { group: 1 } } }],
    metadata: { taxa: 'legacy' },
    getSurvey: () => ({ taxa: 'birds' }),
  };

  expect(getSampleTaxa(sample)).toBe('birds');

  sample.occurrences = [];
  expect(getSampleTaxa(sample)).toBe('legacy');
});

it('preserves legacy plant abundance attributes separately', () => {
  [
    ['number', 12, 'occAttr:16', 12],
    ['numberDAFOR', 'Frequent', 'occAttr:2', '3'],
    ['number-ranges', '6-20', 'occAttr:523', '667'],
  ].forEach(([oldKey, oldValue, newKey, newValue]) => {
    const occurrence = { data: { [oldKey]: oldValue }, metadata: {} };

    migrateOldPlantFungiAbundanceAttrs(occurrence);

    expect(occurrence.data).toEqual({ [newKey]: newValue });
    expect(occurrence.metadata._migrated).toEqual({ [oldKey]: oldValue });
  });
});

it('moves legacy location fields across the sample tree', () => {
  const child = {
    data: { location: { name: 'Child', geocoded: { center: [1, 2] } } },
    metadata: {},
    samples: [],
  };
  const sample = {
    data: { location: { name: 'Parent', geocoded: { center: [3, 4] } } },
    metadata: {},
    samples: [child],
  };

  migrateLocationTree(sample);

  expect(sample.data).toEqual({ location: {}, locationName: 'Parent' });
  expect(sample.metadata.geocoded).toEqual({ center: [3, 4] });
  expect(sample.metadata._migrated).toEqual({
    'location.name': 'Parent',
    'location.geocoded': { center: [3, 4] },
  });
  expect(child.data).toEqual({ location: {}, locationName: 'Child' });
  expect(child.metadata.geocoded).toEqual({ center: [1, 2] });
  expect(child.metadata._migrated).toEqual({
    'location.name': 'Child',
    'location.geocoded': { center: [1, 2] },
  });
});
