/******************************************************************************
 * Validation.
 *****************************************************************************/

export default {
  email: function (email) {
    var re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
  },

  updateViewFormErrors: function ($view, errors, selector) {
    var clearFormErrors = function(){
      $view.find("span.error").each(function(){
        $(this).remove();
      });
      $view.find(".input-row.error").each(function(){
        $(this).removeClass("error");
      });
    }

    var markErrors = function(value, key){
      var $controlGroup = $view.find(selector + key).parent();
      var $errorEl = $("<span>", { class: "error", text: value });
      $controlGroup.append($errorEl).addClass("error");
    }

    clearFormErrors();
    _.each(errors, markErrors);
  }
};
