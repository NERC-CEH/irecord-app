import {
  getSampleTaxa,
  migrateSampleTree,
  migratePlantGridRefSystems,
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

it('sets Plant grid reference systems across the sample tree', () => {
  const child = {
    data: {
      enteredSrefSystem: 'OSIE',
      location: { gridref: 'SU1234' },
    },
    samples: [],
  };
  const sample = {
    data: {
      enteredSrefSystem: 'OSGB',
      location: { gridref: 'H3382' },
    },
    samples: [child],
  };

  migratePlantGridRefSystems(sample);

  expect(sample.data.enteredSrefSystem).toBe('OSIE');
  expect(child.data.enteredSrefSystem).toBe('OSGB');
});

it('moves legacy sample fields across the sample tree', () => {
  const child = {
    data: {
      date: '2026-08-29T08:23:59.139Z',
      location: { name: 'Child', geocoded: { center: [1, 2] } },
    },
    metadata: {},
    samples: [],
  };
  const sample = {
    data: {
      date: '2026-08-30T08:23:59.139Z',
      location: { name: 'Parent', geocoded: { center: [3, 4] } },
    },
    metadata: {},
    samples: [child],
  };

  migrateSampleTree(sample);

  expect(sample.data).toEqual({
    date: '2026-08-30',
    location: {},
    locationName: 'Parent',
  });
  expect(sample.metadata.geocoded).toEqual({ center: [3, 4] });
  expect(sample.metadata._migrated).toEqual({
    date: '2026-08-30T08:23:59.139Z',
    'location.name': 'Parent',
    'location.geocoded': { center: [3, 4] },
  });
  expect(child.data).toEqual({
    date: '2026-08-29',
    location: {},
    locationName: 'Child',
  });
  expect(child.metadata.geocoded).toEqual({ center: [1, 2] });
  expect(child.metadata._migrated).toEqual({
    date: '2026-08-29T08:23:59.139Z',
    'location.name': 'Child',
    'location.geocoded': { center: [1, 2] },
  });
});
