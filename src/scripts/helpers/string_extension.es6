define([], function () {
  String.prototype.limit = function(char_n) {
    var value = this;
    var ellipsis = value && value.length > char_n ? '...' : '';
    return value ? value.substring(0, char_n) + ellipsis : '';
  };

  //http://shebang.brandonmintern.com/foolproof-html-escaping-in-javascript/
  String.prototype.escape = function () {
    var value = this;
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(value));
    return div.innerHTML;
  };

  return String;
});