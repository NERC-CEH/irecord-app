import { FC, useContext } from 'react';
import { observer } from 'mobx-react';
import { Page, Header, Main } from '@flumens';
import TaxonSearch, {
  TaxonSearchFilters,
} from 'Survey/common/Components/TaxonSearch';
import Sample from 'models/sample';
import userModel from 'models/user';
import appModel, { SurveyDraftKeys } from 'models/app';
import savedSamples from 'models/savedSamples';
import Occurrence from 'models/occurrence';
import { useRouteMatch } from 'react-router';
import surveyConfig from 'Survey/Default/config';
import { NavContext } from '@ionic/react';

type Props = {
  sample?: Sample;
};

const Taxon: FC<Props> = ({ sample }) => {
  const { navigate, goBack } = useContext(NavContext);
  const match = useRouteMatch();

  const getNewSample = async (taxon: any) => {
    const newSample = await surveyConfig.create(Sample, Occurrence, { taxon });
    newSample.save();
    savedSamples.push(newSample);
    return newSample;
  };

  const onSpeciesSelected = async (taxon: any) => {
    const isNew = !sample;

    if (isNew) {
      const newSample = await getNewSample(taxon);
      const survey = newSample.getSurvey();
      const draftIdKey = `draftId:${survey.name}` as keyof SurveyDraftKeys;
      appModel.attrs[draftIdKey] = newSample.cid;

      const url = match.url.replace('/new', '');
      navigate(`${url}/${newSample.cid}`, undefined, 'replace');

      return;
    }

    const [occ] = sample.occurrences;
    sample.removeOldTaxonAttributes(occ, taxon);

    occ.attrs.taxon = taxon;
    await occ.save();

    goBack();
  };

  const getUserFavouriteSpecies = () => {
    const { statistics } = userModel.attrs;
    if (!statistics || !statistics.species || !statistics.species.length) {
      return null;
    }
    return [...statistics.species];
  };

  const { searchNamesOnly, taxonGroupFilters: selectedFilters } =
    appModel.attrs;

  return (
    <Page id="taxon">
      <Header title="Species" rightSlot={<TaxonSearchFilters />} />
      <Main>
        <TaxonSearch
          onSpeciesSelected={onSpeciesSelected}
          favouriteSpecies={getUserFavouriteSpecies()}
          namesFilter={searchNamesOnly}
          informalGroups={selectedFilters}
        />
      </Main>
    </Page>
  );
};

export default observer(Taxon);
