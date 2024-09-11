import { RouteWithModels, AttrPage } from '@flumens';
import savedSamples from 'models/savedSamples';
import Activity from 'Survey/common/Components/Activity';
import ModelLocation from 'Survey/common/Components/ModelLocation';
import StartNewSurvey from 'Survey/common/Components/StartNewSurvey';
import Taxon from 'Survey/common/Components/Taxon';
import ListHome from './Home';
import OccurrenceHome from './OccurrenceHome';
import survey from './config';

const { AttrPageFromRoute } = AttrPage;

const baseURL = `/survey/${survey.name}`;

const routes = [
  [`${baseURL}`, StartNewSurvey.with(survey), true],
  [`${baseURL}/:smpId`, ListHome],
  [`${baseURL}/:smpId/:attr`, AttrPageFromRoute],
  [`${baseURL}/:smpId/location`, ModelLocation],
  [`${baseURL}/:smpId/activity`, Activity],
  [`${baseURL}/:smpId/taxon`, Taxon],
  [`${baseURL}/:smpId/smp/:subSmpId`, OccurrenceHome],
  [`${baseURL}/:smpId/smp/:subSmpId/:attr`, AttrPageFromRoute],
  [`${baseURL}/:smpId/smp/:subSmpId/location`, ModelLocation.WithoutName],
  [`${baseURL}/:smpId/smp/:subSmpId/occ/:occId/:attr`, AttrPageFromRoute],
  [`${baseURL}/:smpId/smp/:subSmpId/occ/:occId/taxon`, Taxon],
];

export default RouteWithModels.fromArray(savedSamples, routes);
