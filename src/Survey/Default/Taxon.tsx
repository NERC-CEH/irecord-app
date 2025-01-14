import { useContext } from 'react';
import { observer } from 'mobx-react';
import { useRouteMatch } from 'react-router';
import { Page, Header, Main } from '@flumens';
import { NavContext } from '@ionic/react';
import appModel from 'models/app';
import Occurrence from 'models/occurrence';
import Sample from 'models/sample';
import savedSamples from 'models/savedSamples';
import surveyConfig from 'Survey/Default/config';
import TaxonSearch, {
  TaxonSearchFilters,
} from 'Survey/common/Components/TaxonSearch';

const getNewSample = async (taxon: any) => {
  const newSample = await surveyConfig.create({ Sample, Occurrence, taxon });
  newSample.save();
  savedSamples.push(newSample);
  return newSample;
};

const Taxon = () => {
  const { navigate } = useContext(NavContext);
  const match = useRouteMatch();

  const onSpeciesSelected = async (taxon: any) => {
    const newSample = await getNewSample(taxon);
    const url = match.url.replace('/new', '');
    navigate(`${url}/${newSample.cid}`, undefined, 'replace');
  };

  const { searchNamesOnly, taxonSearchGroupFilters } = appModel.attrs;

  const selectedFilters = taxonSearchGroupFilters.flat().flat();

  return (
    <Page id="taxon">
      <Header title="Species" rightSlot={<TaxonSearchFilters />} />
      <Main>
        <TaxonSearch
          onSpeciesSelected={onSpeciesSelected}
          namesFilter={searchNamesOnly}
          selectedFilters={selectedFilters}
        />
      </Main>
    </Page>
  );
};

export default observer(Taxon);
