import Morel from 'morel';
import CONFIG from 'config';
import ImageModel from './image';
import appModel from './app_model';

export default Morel.Occurrence.extend({
  Image: ImageModel,

  keys: CONFIG.morel.occurrence, // warehouse attribute keys

  initialize() {
    // training setting
    const training = appModel.get('useTraining');
    this.set('training', training);
  },
});
