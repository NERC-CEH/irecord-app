import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import defaultSurvey, {
  _getFullTaxaGroupSurvey,
  getTaxaGroupSurvey,
} from 'Survey/Default/config';
import birdsSurvey from '../birds';
import dragonfliesSurvey from '../dragonflies';

i18n.use(initReactI18next).init({ lng: 'en' });

describe('_getFullTaxaGroupSurvey', () => {
  it('should return default survey if no species group', () => {
    // Given
    const speciesGroup = null;

    // When
    const survey = _getFullTaxaGroupSurvey(speciesGroup);

    // Then
    expect(survey.taxa).toBe(defaultSurvey.taxa);
  });

  it('should return default survey if no species group config was found', () => {
    // Given
    const speciesGroup = 111111111; // some random one

    // When
    const survey = _getFullTaxaGroupSurvey(speciesGroup);

    // Then
    expect(survey.taxa).toBe(defaultSurvey.taxa);
  });

  it('should not merge render object', () => {
    // Given
    const speciesGroup = 1; // some random one

    // When
    const survey = _getFullTaxaGroupSurvey(speciesGroup);

    // Then
    expect(survey.taxa).toBe(defaultSurvey.taxa);
  });

  it('should return default render if none specified', () => {
    // Given
    const speciesGroup = 104;

    // When
    const survey = _getFullTaxaGroupSurvey(speciesGroup);

    // Then
    expect(survey.render).toBe(defaultSurvey.render);
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
