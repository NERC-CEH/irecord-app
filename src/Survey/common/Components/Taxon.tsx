import { useContext } from 'react';
import { observer } from 'mobx-react';
import { useTranslation } from 'react-i18next';
import { useRouteMatch } from 'react-router';
import { Page, Header, Main, useToast } from '@flumens';
import { NavContext } from '@ionic/react';
import appModel from 'models/app';
import Occurrence, { Taxon as TaxonI } from 'models/occurrence';
import Sample from 'models/sample';
import TaxonSearch, { TaxonSearchFilters } from './TaxonSearch';

type Props = {
  sample: Sample;
  subSample?: Sample;
  occurrence?: Occurrence;
};

const Taxon = ({ sample, subSample, occurrence }: Props) => {
  const { navigate, goBack } = useContext(NavContext);
  const { url } = useRouteMatch<any>();
  const toast = useToast();
  const { t } = useTranslation();

  const surveyConfig = (subSample || sample)?.getSurvey();
  const shouldCreateOccurrences = !!surveyConfig.occ?.create;

  const createNewOccurrenceModel = async (taxon: any) => {
    const newOccurrence = (await surveyConfig.occ?.create?.({
      Occurrence,
      taxon,
    })) as Occurrence;
    sample.occurrences.push(newOccurrence);
    sample.save();

    return newOccurrence;
  };

  const createNewSampleModel = async (taxon: TaxonI) => {
    const newSample = (await surveyConfig.smp?.create?.({
      Sample,
      Occurrence,
      taxon,
      surveySample: sample,
    })) as Sample;

    sample.samples.push(newSample);
    sample.save();

    return newSample;
  };

  const createNewModel = shouldCreateOccurrences
    ? createNewOccurrenceModel
    : createNewSampleModel;

  const editingExisting = subSample || occurrence;

  const onSpeciesSelected = async (taxon: any, editBtnClicked?: boolean) => {
    if (editingExisting) {
      const occ = (occurrence || subSample?.occurrences[0]) as Occurrence;
      occ.setTaxon(taxon);

      goBack();
      return;
    }

    const newModel = await createNewModel(taxon);

    if (editBtnClicked) {
      const newUrl = url.replace('/taxon', '');
      const modelPath = shouldCreateOccurrences ? 'occ' : 'smp';
      navigate(`${newUrl}/${modelPath}/${newModel.cid}`, undefined, 'replace');
      return;
    }

    const name =
      taxon.found_in_name >= 0
        ? taxon.common_names[taxon.found_in_name]
        : taxon.scientific_name;

    toast.success(`${t('Added')} ${name}`, {
      duration: 500,
      skipTranslation: true,
      position: 'bottom',
    });
  };

  const { searchNamesOnly, taxonSearchGroupFilters } = appModel.attrs;

  const isSpeciesRestrictedSurvey =
    surveyConfig.name !== 'default' && surveyConfig.taxaGroups;
  const rightSlot = !isSpeciesRestrictedSurvey && <TaxonSearchFilters />;

  const informalGroups = isSpeciesRestrictedSurvey
    ? surveyConfig.taxaGroups
    : taxonSearchGroupFilters.flat().flat();
  const namesFilter = isSpeciesRestrictedSurvey ? undefined : searchNamesOnly;

  const suggestedSpecies = occurrence?.getSuggestions();
  const suggestionsAreLoading = occurrence?.isIdentifying();

  return (
    <Page id="taxon">
      <Header title="Species" rightSlot={rightSlot} />
      <Main>
        <TaxonSearch
          onSpeciesSelected={onSpeciesSelected}
          resetOnSelect
          showEditButton={!editingExisting}
          selectedFilters={informalGroups}
          namesFilter={namesFilter}
          suggestedSpecies={suggestedSpecies}
          suggestionsAreLoading={suggestionsAreLoading}
        />
      </Main>
    </Page>
  );
};

export default observer(Taxon);
