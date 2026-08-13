import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { onChange } from '@flumens/tailwind/dist/components/Block';
import appModel from 'models/app';
import defaultSurvey, {
  getFullTaxaGroupSurvey,
  getTaxaGroupSurvey,
  taxonGroupSurveys,
} from 'Survey/Default/config';
import birdsSurvey from '../birds';
import butterfliesSurvey, { butterflyNumberRangesAttr } from '../butterflies';
import {
  defaultSensitivityPrecisionAttr,
  numberAttr,
  numberRangesAttr,
} from '../common';
import dragonfliesSurvey from '../dragonflies';

i18n.use(initReactI18next).init({ lng: 'en' });

describe('default survey', () => {
  it('groups abundance inputs into one page', () => {
    const [abundance] = defaultSurvey.occ.render;

    expect(abundance.id).toBe('numberPage');
    expect(abundance.blocks).toHaveLength(3);
    ['arthropods', 'birds', 'mammals', 'moths', 'reptiles'].forEach(taxa =>
      expect(taxonGroupSurveys[taxa].occ.render[0]).toBe(abundance)
    );
  });

  it('keeps one abundance value', () => {
    const record = { [numberRangesAttr.id]: '665' };

    numberAttr.onChange(3, 'change', { record });
    expect(record).toEqual({ [numberAttr.id]: 3 });

    numberRangesAttr.onChange('666', 'change', {
      record,
      history: { goBack: jest.fn() },
    });
    expect(record).toEqual({
      [numberRangesAttr.id]: '666',
    });
  });

  it('stores the selected sensitivity precision', () => {
    const record = {};
    const props = {
      record,
      blockIds: [],
      blockConfig: defaultSensitivityPrecisionAttr,
    };

    onChange('1000', 'change', props);
    expect(record.sensitivityPrecision).toBe('1000');

    onChange('', 'change', props);
    expect(record.sensitivityPrecision).toBe('');
  });

  it('uses the butterfly range attribute for locking', () => {
    const [abundance] = butterfliesSurvey.occ.render;
    const lockArgs = {
      record: { [butterflyNumberRangesAttr.id]: '2402' },
      survey: 'default',
      taxa: 'butterflies',
    };
    const isLocked = jest
      .spyOn(appModel.locks, 'isLocked')
      .mockReturnValue(true);
    const unset = jest.spyOn(appModel.locks, 'unset').mockImplementation();

    expect(abundance.lock.isLocked(lockArgs)).toBe(true);
    abundance.lock.unset(lockArgs);

    expect(isLocked).toHaveBeenCalledWith(
      'default',
      'butterflies',
      'occ',
      butterflyNumberRangesAttr.id,
      '2402'
    );
    expect(unset).toHaveBeenCalledWith(
      'default',
      'butterflies',
      'occ',
      butterflyNumberRangesAttr.id
    );

    isLocked.mockRestore();
    unset.mockRestore();
  });
});

describe('getFullTaxaGroupSurvey', () => {
  it('should return default survey if no species group', () => {
    // Given
    const speciesGroup = null;

    // When
    const survey = getFullTaxaGroupSurvey(speciesGroup);

    // Then
    expect(survey.taxa).toBe(defaultSurvey.taxa);
  });

  it('should return default survey if no species group config was found', () => {
    // Given
    const speciesGroup = 111111111; // some random one

    // When
    const survey = getFullTaxaGroupSurvey(speciesGroup);

    // Then
    expect(survey.taxa).toBe(defaultSurvey.taxa);
  });

  it('should not merge render object', () => {
    // Given
    const speciesGroup = 1; // some random one

    // When
    const survey = getFullTaxaGroupSurvey(speciesGroup);

    // Then
    expect(survey.taxa).toBe(defaultSurvey.taxa);
  });

  it('should return default render if none specified', () => {
    // Given
    const speciesGroup = 104;

    // When
    const survey = getFullTaxaGroupSurvey(speciesGroup);

    // Then
    expect(survey.render).toBe(defaultSurvey.render);
  });

  it('should retain recorder config for custom surveys', () => {
    const survey = getFullTaxaGroupSurvey('dragonflies');

    expect(survey.attrs['smpAttr:127']).toBeDefined();
    expect(survey.attrs['smpAttr:59']).toBeDefined();
  });
});

describe('getTaxaGroupSurvey', () => {
  it('should should return a taxa survey that matches taxaGroup', () => {
    // Given
    const taxaGroup = birdsSurvey.taxaGroups[0];

    // When
    const survey = getTaxaGroupSurvey(taxaGroup);

    // Then
    expect(survey.taxa).toBe('birds');
  });

  it('should should return a taxa survey with highest taxaPriority', () => {
    // Given
    const taxaGroup = dragonfliesSurvey.taxaGroups[0];

    // When
    const survey = getTaxaGroupSurvey(taxaGroup);

    // Then
    expect(survey.taxa).not.toEqual('arthropods');
    expect(survey.taxa).toEqual('dragonflies');
  });
});
