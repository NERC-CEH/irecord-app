import { RouteWithModels, AttrPage } from '@flumens';
import samples from 'models/collections/samples';
import Activity from 'Survey/common/Components/Activity';
import ModelLocation from 'Survey/common/Components/ModelLocation';
import StartNewSurvey from 'Survey/common/Components/StartNewSurvey';
import Taxon from 'Survey/common/Components/Taxon';
import Home from './Home';
import OccurrenceHome from './OccurrenceHome';
import survey from './config';

const { AttrPageFromRoute } = AttrPage;

const baseURL = `/survey/${survey.name}`;

const routes = [
  [`${baseURL}`, StartNewSurvey.with(survey), true],
  [`${baseURL}/:smpId`, Home],
  [`${baseURL}/:smpId/:attr`, AttrPageFromRoute],
  [`${baseURL}/:smpId/location`, ModelLocation],
  [`${baseURL}/:smpId/activity`, Activity],
  [`${baseURL}/:smpId/taxon`, Taxon],
  [`${baseURL}/:smpId/occ/:occId`, OccurrenceHome],
  [`${baseURL}/:smpId/occ/:occId/:attr`, AttrPageFromRoute],
  [`${baseURL}/:smpId/occ/:occId/taxon`, Taxon],
];

export default RouteWithModels.fromArray(samples, routes);
