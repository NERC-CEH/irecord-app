/** *********************************************************************
 * ERROR
 **********************************************************************/
class Error {
  constructor(options = {}) {
    if (typeof options === 'string') {
      // message only
      this.code = -1;
      this.message = options;
      return;
    } else if (options instanceof Array) {
      // array of errors
      this.message = options.reduce(
        (message, error) => `${message}${error.title}\n`,
        '');
      return;
    }

    this.code = options.code || -1;
    this.message = options.message || '';
  }
}

export { Error as default };
