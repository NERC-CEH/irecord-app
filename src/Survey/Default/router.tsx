import { Route } from 'react-router-dom';
import { AttrPage, withSample } from 'common/flumens';
import Group from 'Survey/common/Components/Group';
import ModelLocation from 'Survey/common/Components/ModelLocation';
import StartNewSurvey from 'Survey/common/Components/StartNewSurvey';
import Taxon from 'Survey/common/Components/Taxon';
import Home from './Home';
import NewSurveyTaxon from './Taxon';
import survey from './config';

const url = `/survey/${survey.name}`;

const { AttrPageFromRoute } = AttrPage;

const routes = [
  [`${url}`, StartNewSurvey.with(survey, NewSurveyTaxon)],
  [`${url}/:smpId`, Home],
  [`${url}/:smpId/:attr`, withSample(AttrPageFromRoute)],
  [`${url}/:smpId/location`, ModelLocation],
  [`${url}/:smpId/groupId`, Group],
  [`${url}/:smpId/occ/:occId/:attr`, withSample(AttrPageFromRoute)],
  [`${url}/:smpId/occ/:occId/taxon`, Taxon],
].map(([route, component]: any) => (
  <Route key={route} path={route} component={component} exact />
));

export default routes;
