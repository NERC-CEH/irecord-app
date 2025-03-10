import { Route } from 'react-router-dom';
import { AttrPage, withSample } from '@flumens';
import Group from 'Survey/common/Components/Group';
import StartNewSurvey from 'Survey/common/Components/StartNewSurvey';
import Taxon from 'Survey/common/Components/Taxon';
import Home from './Home';
import Location from './Location';
import OccurrenceHome from './Occurrence/Home';
import OccurrenceLocation from './Occurrence/Location';
import survey from './config';

const { AttrPageFromRoute } = AttrPage;

const baseURL = `/survey/${survey.name}`;

const routes = [
  [`${baseURL}`, StartNewSurvey.with(survey), true],
  [`${baseURL}/:smpId`, Home],
  [`${baseURL}/:smpId/:attr`, withSample(AttrPageFromRoute)],
  [`${baseURL}/:smpId/location`, Location],
  [`${baseURL}/:smpId/groupId`, Group],
  [`${baseURL}/:smpId/taxon`, Taxon],
  [`${baseURL}/:smpId/smp/:subSmpId`, OccurrenceHome],
  [`${baseURL}/:smpId/smp/:subSmpId/:attr`, withSample(AttrPageFromRoute)],
  [`${baseURL}/:smpId/smp/:subSmpId/location`, OccurrenceLocation],
  [
    `${baseURL}/:smpId/smp/:subSmpId/occ/:occId/:attr`,
    withSample(AttrPageFromRoute),
  ],
  [`${baseURL}/:smpId/smp/:subSmpId/occ/:occId/taxon`, Taxon],
].map(([route, component]: any) => (
  <Route key={route} path={route} component={component} exact />
));

export default routes;
