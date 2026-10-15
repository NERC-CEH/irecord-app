import appModel from 'models/app';
import defaultSurvey, { taxonGroupSurveys } from 'Survey/Default/config';
import listSurvey from 'Survey/List/config';
import { butterflyNumberRangesAttr } from '../butterflies';
import { numberAttr, numberRangesAttr } from '../common';

const countingSurveys = {
  ...Object.fromEntries(
    ['arthropods', 'birds', 'butterflies', 'mammals', 'moths', 'reptiles'].map(
      taxa => [taxa, taxonGroupSurveys[taxa]]
    )
  ),
};

beforeEach(() => {
  jest.spyOn(appModel.locks, 'getAll').mockReturnValue({ smp: {}, occ: {} });
});

afterEach(() => jest.restoreAllMocks());

describe.each(Object.entries(countingSurveys))(
  '%s occurrence defaults',
  (taxa, survey) => {
    const taxon = { group: survey.taxaGroups[0] ?? -1 };
    const create = isListSurvey => survey.occ.create({ taxon, isListSurvey });

    it.each([undefined, false, true])(
      'defaults counts only for list entries (%s)',
      async isListSurvey => {
        const occurrence = await create(isListSurvey);

        expect(occurrence.data[numberAttr.id]).toBe(
          isListSurvey ? 1 : undefined
        );
        expect(appModel.locks.getAll).toHaveBeenCalledWith(
          isListSurvey ? 'list' : 'default',
          taxa
        );
      }
    );

    it.each([0, 5])('preserves a locked count of %s', async count => {
      appModel.locks.getAll.mockReturnValue({
        smp: {},
        occ: { [numberAttr.id]: count },
      });

      const occurrence = await create(true);

      expect(occurrence.data[numberAttr.id]).toBe(count);
    });

    it('does not add a count when a range is locked', async () => {
      const rangeAttr =
        taxa === 'butterflies' ? butterflyNumberRangesAttr : numberRangesAttr;
      const range = rangeAttr.choices.find(
        choice => choice.title === (taxa === 'butterflies' ? '2-9' : '2-5')
      ).dataName;
      appModel.locks.getAll.mockReturnValue({
        smp: {},
        occ: { [rangeAttr.id]: range },
      });

      const occurrence = await create(true);

      expect(occurrence.data[numberAttr.id]).toBeUndefined();
      expect(occurrence.data[rangeAttr.id]).toBe(range);
    });
  }
);

it('leaves counts unset in the generic Default factory', async () => {
  const occurrence = await defaultSurvey.occ.create({ taxon: { group: -1 } });

  expect(occurrence.data[numberAttr.id]).toBeUndefined();
  expect(appModel.locks.getAll).toHaveBeenCalledWith('default', 'default');
});

it('creates a list entry before a taxon is selected', async () => {
  const surveySample = await listSurvey.create({});
  const sample = await listSurvey.smp.create({ surveySample });

  expect(sample.occurrences[0].data.taxon).toBeUndefined();
  expect(sample.occurrences[0].data[numberAttr.id]).toBeUndefined();
});

const getTaxon = taxa => ({
  group: taxonGroupSurveys[taxa]?.taxaGroups[0] ?? -1,
});

const createListEntry = async taxa => {
  const surveySample = await listSurvey.create({});
  const sample = await listSurvey.smp.create({
    surveySample,
    taxon: taxa ? getTaxon(taxa) : undefined,
  });
  surveySample.samples.push(sample);

  return sample;
};

it.each(['default', 'list'])(
  'applies deferred occurrence locks to an unmatched first taxon in %s surveys',
  async survey => {
    const sample =
      survey === 'list'
        ? await createListEntry()
        : await defaultSurvey.create({});
    appModel.locks.getAll.mockReturnValue({
      smp: {},
      occ: { [numberAttr.id]: 5 },
    });

    sample.setTaxon(getTaxon('default'));

    expect(appModel.locks.getAll).toHaveBeenCalledWith(survey, 'default');
    expect(sample.occurrences[0].data[numberAttr.id]).toBe(5);
  }
);

it.each(['default', ...Object.keys(taxonGroupSurveys)])(
  'applies matching defaults after selecting a %s taxon for a photo-first entry',
  async taxa => {
    const sample = await createListEntry();

    sample.setTaxon(getTaxon(taxa));

    expect(sample.occurrences[0].toDTO().values[numberAttr.id]).toBe(
      taxa === 'default' || taxa in countingSurveys ? 1 : undefined
    );
  }
);

it.each([
  ['plants-fungi', 'mammals'],
  ['mammals', 'reptiles'],
  ['birds', 'plants-fungi'],
  ['butterflies', 'bryophytes'],
  ['mammals', 'dragonflies'],
])('updates defaults when changing %s to %s', async (previousTaxa, taxa) => {
  const sample = await createListEntry(previousTaxa);

  sample.setTaxon(getTaxon(taxa));

  expect(sample.occurrences[0].toDTO().values[numberAttr.id]).toBe(
    taxa in countingSurveys ? 1 : undefined
  );
});

describe.each(Object.entries(countingSurveys))(
  '%s locks when selecting or changing a taxon',
  (taxa, survey) => {
    const rangeAttr =
      taxa === 'butterflies' ? butterflyNumberRangesAttr : numberRangesAttr;
    const range = rangeAttr.choices.find(
      choice => choice.title === (taxa === 'butterflies' ? '2-9' : '2-5')
    ).dataName;

    describe.each([undefined, 'plants-fungi'])('from %s', previousTaxa => {
      it.each([
        { [numberAttr.id]: 0 },
        { [numberAttr.id]: 5 },
        { [rangeAttr.id]: range },
        { [rangeAttr.id]: '' },
      ])('preserves locked values %j', async lockedValues => {
        const sample = await createListEntry(previousTaxa);
        appModel.locks.getAll.mockReturnValue({
          smp: {},
          occ: lockedValues,
        });

        sample.setTaxon({ group: survey.taxaGroups[0] });

        expect(sample.occurrences[0].data[numberAttr.id]).toBe(
          lockedValues[numberAttr.id]
        );
        expect(sample.occurrences[0].data[rangeAttr.id]).toBe(
          lockedValues[rangeAttr.id]
        );
      });
    });
  }
);

it('does not reapply defaults within the same taxon group', async () => {
  const sample = await createListEntry('birds');
  sample.occurrences[0].data[numberAttr.id] = 5;
  const getDefaultValues = jest.spyOn(
    taxonGroupSurveys.birds.occ,
    'getDefaultValues'
  );

  sample.setTaxon({ ...getTaxon('birds'), warehouseId: 123 });

  expect(getDefaultValues).not.toHaveBeenCalled();
  expect(sample.occurrences[0].data[numberAttr.id]).toBe(5);
});

it('applies defaults between different groups using the same config', async () => {
  const sample = await createListEntry('reptiles');
  delete sample.occurrences[0].data[numberAttr.id];

  sample.setTaxon({ group: taxonGroupSurveys.reptiles.taxaGroups[1] });

  expect(sample.occurrences[0].data[numberAttr.id]).toBe(1);
});

it('keeps single-record counts unset after a group change', async () => {
  const sample = await defaultSurvey.create({
    taxon: getTaxon('plants-fungi'),
  });

  sample.setTaxon(getTaxon('birds'));

  expect(sample.occurrences[0].data[numberAttr.id]).toBeUndefined();
});

it.each(['default', ...Object.keys(taxonGroupSurveys)])(
  'uses the matching defaults for a %s list entry',
  async taxa => {
    const surveySample = await listSurvey.create({});
    const sample = await listSurvey.smp.create({
      surveySample,
      taxon: { group: taxonGroupSurveys[taxa]?.taxaGroups[0] ?? -1 },
    });
    surveySample.samples.push(sample);

    expect(sample.getSurvey().occ.getDefaultValues).toBe(
      taxa === 'default'
        ? listSurvey.smp.occ.getDefaultValues
        : taxonGroupSurveys[taxa].occ.getDefaultValues
    );
    expect(sample.occurrences[0].data[numberAttr.id]).toBe(
      taxa === 'default' || taxa in countingSurveys ? 1 : undefined
    );
  }
);
