define([], function () {
  Date.prototype.toDateInputValue = function() {
    var local = new Date(this);
    local.setMinutes(this.getMinutes() - this.getTimezoneOffset());
    return local.toJSON().slice(0,10);
  };

  Date.prototype.print = function() {
    return this.getDate() + "/" + (this.getMonth() + 1) + "/"  + this.getFullYear();
  };
});