define([], function () {
  String.prototype.limit = function(char_n) {
    var value = this;
    var ellipsis = value && value.length > char_n ? '...' : '';
    return value ? value.substring(0, char_n) + ellipsis : '';
  };

  return String;
});