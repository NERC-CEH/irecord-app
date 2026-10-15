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
  expect(sample.occurrences[0].data[numberAttr.id]).toBe(1);
});

it.each(['default', ...Object.keys(taxonGroupSurveys)])(
  'uses the matching defaults for a %s list entry',
  async taxa => {
    const surveySample = await listSurvey.create({});
    const sample = await listSurvey.smp.create({
      surveySample,
      taxon: { group: taxonGroupSurveys[taxa]?.taxaGroups[0] ?? -1 },
    });

    expect(sample.occurrences[0].data[numberAttr.id]).toBe(
      taxa === 'default' || taxa in countingSurveys ? 1 : undefined
    );
  }
);
