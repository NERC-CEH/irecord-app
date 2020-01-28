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
    const dateStr = `${local.getDate()}/${local.getMonth() +
      1}/${local.getFullYear()}`;

    if (pretty) {
      const today = new Date();
      const todayStr = `${today.getDate()}/${today.getMonth() +
        1}/${today.getFullYear()}`;
      const isToday = todayStr === dateStr;

      if (isToday) {
        return t('Today');
      }
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const yesterdayStr = `${yesterday.getDate()}/${yesterday.getMonth() +
        1}/${yesterday.getFullYear()}`;
      const isYesterday = yesterdayStr === dateStr;

      if (isYesterday) {
        return t('Yesterday');
      }
    }
    return dateStr;
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
