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

  print(date, pretty) {
    const local = new Date(date);
    const sampleDate = `${local.getDate()}/${(local.getMonth() + 1)}/${local.getFullYear()}`;

    const today = new Date();
    const todayDateOnly = `${today.getDate()}/${(today.getMonth() + 1)}/${today.getFullYear()}`;
    const isToday = (todayDateOnly === sampleDate);

    return (pretty && isToday ? 'Today' : sampleDate);
  },

  /**
   * Validates the date
   * @param date
   * @returns {boolean}
   */
  validate(date) {
    return date.toString() !== 'Invalid Date' && date <= new Date();
  },
};
