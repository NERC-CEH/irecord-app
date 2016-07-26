export default {
  /**
   * Date object to date input value
   * @param date
   * @returns {string} eg. '2016-07-12'
   */
  toDateInputValue(date) {
    const local = new Date(date);
    local.setMinutes(local.getMinutes() - local.getTimezoneOffset());
    return local.toJSON().slice(0, 10);
  },

  print(date) {
    const local = new Date(date);
    return `${local.getDate()}/${(local.getMonth() + 1)}/${local.getFullYear()}`;
  },
};
