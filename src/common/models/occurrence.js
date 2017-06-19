import Indicia from 'indicia';
import CONFIG from 'config';
import ImageModel from './image';

export default Indicia.Occurrence.extend({
  Image: ImageModel,

  keys: CONFIG.indicia.occurrence, // warehouse attribute keys
});
