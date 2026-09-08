import { Route } from 'react-router-dom';
import { AttrPage, withSample } from '@flumens';
import Group from 'Survey/common/Components/Group';
import ModelLocation from 'Survey/common/Components/ModelLocation';
import StartNewSurvey from 'Survey/common/Components/StartNewSurvey';
import Taxon from 'Survey/common/Components/Taxon';
import Home from './Home';
import OccurrenceHome from './OccurrenceHome';
import survey from './config';

const { AttrPageFromRoute } = AttrPage;

const baseURL = `/survey/${survey.name}`;

const routes = [
  [baseURL, StartNewSurvey.with(survey)],
  [`${baseURL}/:smpId`, Home],
  [`${baseURL}/:smpId/:attr`, withSample(AttrPageFromRoute)],
  [`${baseURL}/:smpId/location`, ModelLocation],
  [`${baseURL}/:smpId/groupId`, Group],
  [`${baseURL}/:smpId/taxon`, Taxon],
  [`${baseURL}/:smpId/smp/:subSmpId`, OccurrenceHome],
  [`${baseURL}/:smpId/smp/:subSmpId/:attr`, withSample(AttrPageFromRoute)],
  [
    `${baseURL}/:smpId/smp/:subSmpId/location`,
    () => <ModelLocation skipLocationName />,
  ],
  [
    `${baseURL}/:smpId/smp/:subSmpId/occ/:occId/:attr`,
    withSample(AttrPageFromRoute),
  ],
  [`${baseURL}/:smpId/smp/:subSmpId/occ/:occId/taxon`, Taxon],
] as const;

export default routes.map(([route, component]) => (
  <Route key={route} path={route} component={component} exact />
));
