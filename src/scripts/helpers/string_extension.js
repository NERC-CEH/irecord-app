String.prototype.limit = function (charNum) {
  var value = this;
  var ellipsis = value && value.length > charNum ? '...' : '';
  return value ? value.substring(0, charNum) + ellipsis : '';
};

// http://shebang.brandonmintern.com/foolproof-html-escaping-in-javascript/
String.prototype.escape = function () {
  var value = this;
  var div = document.createElement('div');
  div.appendChild(document.createTextNode(value));
  return div.innerHTML;
};