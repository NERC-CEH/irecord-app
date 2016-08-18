/** ****************************************************************************
 * Statistics main view.
 *****************************************************************************/
import Marionette from 'marionette';
import JST from '../../../JST';

export default Marionette.ItemView.extend({
  tagName: 'div',
  template: JST['user/statistics/main'],

  serializeData() {
    const statistics = this.model.get('statistics');
    return {
      species: statistics.speciesRaw,
    };
  },
});;
