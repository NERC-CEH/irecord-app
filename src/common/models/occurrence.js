import Indicia from 'indicia';
import CONFIG from 'config';
import ImageModel from './image';
import appModel from 'app_model';

export default Indicia.Occurrence.extend({
  Image: ImageModel,

  keys: CONFIG.indicia.occurrence, // warehouse attribute keys

  metadata: {
    training: appModel.get('useTraining'),
  },
});
