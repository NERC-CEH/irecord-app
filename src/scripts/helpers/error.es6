define([], function () {
  let Error = function (message) {
    this.message = message;
  };

  return Error;
});