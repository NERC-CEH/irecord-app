import { RouteWithModels, AttrPage } from '@flumens';
import savedSamples from 'models/savedSamples';
import ModelLocation from 'Survey/common/Components/ModelLocation';
import StartNewSurvey from 'Survey/common/Components/StartNewSurvey';
import Activity from 'Survey/common/Components/Activity';
import DefaultHome from './Home';
import Taxon from './Taxon';
import survey from './config';

const { AttrPageFromRoute } = AttrPage;

const baseURL = `/survey/${survey.name}`;

const routes = [
  [`${baseURL}`, StartNewSurvey.with(survey, Taxon), true],
  [`${baseURL}/:smpId`, DefaultHome],
  [`${baseURL}/:smpId/:attr`, AttrPageFromRoute],
  [`${baseURL}/:smpId/location`, ModelLocation],
  [`${baseURL}/:smpId/activity`, Activity],
  [`${baseURL}/:smpId/occ/:occId/:attr`, AttrPageFromRoute],
  [`${baseURL}/:smpId/occ/:occId/taxon`, Taxon],
];

export default RouteWithModels.fromArray(savedSamples, routes);
