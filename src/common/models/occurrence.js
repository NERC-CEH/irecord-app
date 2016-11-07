import $ from 'jquery';
import Morel from 'morel';
import ImageModel from './image';
import CONFIG from 'config';

$.extend(true, Morel.Occurrence.keys, CONFIG.morel.occurrence);

export default Morel.Occurrence.extend({
  Image: ImageModel,
});
