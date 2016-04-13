/** ****************************************************************************
 * Validation.
 *****************************************************************************/
import $ from 'jquery';
import _ from 'lodash';

export default {
  email(email) {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
  },

  gridRef(gridref) {
    const re = /^[A-Za-z]{1,2}\d{2}(?:(?:\d{2}){0,4})?$/;
    return re.test(gridref);
  },

  updateViewFormErrors($view, errors, selector) {
    const clearFormErrors = () => {
      $view.find('span.error').each((int, elem) => {
        $(elem).remove();
      });
      $view.find('.input-row.error').each((int, elem) => {
        $(elem).removeClass('error');
      });
    };

    clearFormErrors();

    _.each(errors, (value, key) => {
      const $controlGroup = $view.find(selector + key).parent();
      const $errorEl = $('<span>', { class: 'error', text: value });
      $controlGroup.append($errorEl).addClass('error');
    });
  },
};
