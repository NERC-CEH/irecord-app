import { RouteWithModels, AttrPage } from '@flumens';
import samples from 'models/collections/samples';
import Activity from 'Survey/common/Components/Activity';
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
  [`${baseURL}/:smpId/:attr`, AttrPageFromRoute],
  [`${baseURL}/:smpId/location`, Location],
  [`${baseURL}/:smpId/activity`, Activity],
  [`${baseURL}/:smpId/taxon`, Taxon],
  [`${baseURL}/:smpId/smp/:subSmpId`, OccurrenceHome],
  [`${baseURL}/:smpId/smp/:subSmpId/:attr`, AttrPageFromRoute],
  [`${baseURL}/:smpId/smp/:subSmpId/location`, OccurrenceLocation],
  [`${baseURL}/:smpId/smp/:subSmpId/occ/:occId/:attr`, AttrPageFromRoute],
  [`${baseURL}/:smpId/smp/:subSmpId/occ/:occId/taxon`, Taxon],
];

export default RouteWithModels.fromArray(samples, routes);
