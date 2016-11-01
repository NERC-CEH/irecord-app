/** ****************************************************************************
 * Validation.
 *****************************************************************************/
import $ from 'jquery';
import _ from 'lodash';

export default {
  email(email) {
    // eslint-disable-next-line max-len
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
  },

  gridRef(gridref) {
    const re = /^[A-Za-z]{1,2}\d{2}(?:(?:\d{2}){0,4})?$/;
    return re.test(gridref);
  },

  updateViewFormErrors($view, errors, selector) {
    const clearFormErrors = () => {
      $view.find('.input-row.error').each((int, elem) => {
        $(elem).removeClass('error');
        $(elem).attr('error-message', null);
      });
    };

    clearFormErrors();

    _.each(errors, (value, key) => {
      const $controlGroup = $view.find(selector + key).parent();
      $controlGroup.addClass('error');
      $controlGroup.attr('error-message', value);
    });
  },
};
