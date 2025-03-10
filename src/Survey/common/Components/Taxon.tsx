import { useContext } from 'react';
import { observer } from 'mobx-react';
import { useTranslation } from 'react-i18next';
import { useRouteMatch } from 'react-router';
import { Page, Header, Main, useToast, useSample } from '@flumens';
import { NavContext } from '@ionic/react';
import appModel from 'models/app';
import Occurrence, { Taxon as TaxonI } from 'models/occurrence';
import Sample from 'models/sample';
import TaxonSearch, { TaxonSearchFilters } from './TaxonSearch';

const Taxon = () => {
  const { navigate, goBack } = useContext(NavContext);
  const { url } = useRouteMatch<any>();
  const toast = useToast();
  const { t } = useTranslation();

  const { sample, subSample, occurrence } = useSample<Sample, Occurrence>();

  const surveyConfig = (subSample || sample)!.getSurvey();
  const shouldCreateOccurrences = !!surveyConfig.occ?.create;

  const createNewOccurrenceModel = async (taxon: any) => {
    const newOccurrence = (await surveyConfig.occ?.create?.({
      Occurrence,
      taxon,
    })) as Occurrence;

    console.log(surveyConfig, newOccurrence);

    sample!.occurrences.push(newOccurrence);
    sample!.save();

    return newOccurrence;
  };

  const createNewSampleModel = async (taxon: TaxonI) => {
    const newSample = (await surveyConfig.smp?.create?.({
      Sample,
      Occurrence,
      taxon,
      surveySample: sample!,
    })) as Sample;

    sample!.samples.push(newSample);
    sample!.save();

    return newSample;
  };

  const createNewModel = shouldCreateOccurrences
    ? createNewOccurrenceModel
    : createNewSampleModel;

  const editingExisting = subSample || occurrence;

  const onSpeciesSelected = async (taxon: TaxonI, editBtnClicked?: boolean) => {
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
      taxon.foundInName! >= 0
        ? taxon.commonNames[taxon.foundInName!]
        : taxon.scientificName;

    toast.success(`${t('Added')} ${name}`, {
      duration: 500,
      skipTranslation: true,
      position: 'bottom',
    });
  };

  const { searchNamesOnly, taxonSearchGroupFilters } = appModel.data;

  const isSpeciesRestrictedSurvey =
    surveyConfig.name !== 'default' && surveyConfig.taxaGroups;
  const rightSlot = !isSpeciesRestrictedSurvey && <TaxonSearchFilters />;

  const informalGroups = isSpeciesRestrictedSurvey
    ? surveyConfig.taxaGroups
    : taxonSearchGroupFilters.flat().flat();
  const namesFilter = isSpeciesRestrictedSurvey ? undefined : searchNamesOnly;

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
          suggestedSpecies={occurrence?.data.classifier?.suggestions}
          suggestionsAreLoading={occurrence?.isIdentifying}
        />
      </Main>
    </Page>
  );
};

export default observer(Taxon);
