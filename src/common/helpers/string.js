export default {
  limit(string, charNum = 20) {
    if (!string) {
      return '';
    }
    const value = string.toString();
    const ellipsis = value && value.length > charNum ? '...' : '';
    return value ? value.substring(0, charNum) + ellipsis : '';
  },

  // http://shebang.brandonmintern.com/foolproof-html-escaping-in-javascript/
  escape(string) {
    const div = document.createElement('div');
    div.appendChild(document.createTextNode(string.toString()));
    const escaped = div.innerHTML.trim();
    return escaped;
  },
};
