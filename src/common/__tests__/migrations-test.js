import { migrateLocationTree } from 'common/migrations';

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
  expect(child.data).toEqual({ location: {}, locationName: 'Child' });
  expect(child.metadata.geocoded).toEqual({ center: [1, 2] });
});
