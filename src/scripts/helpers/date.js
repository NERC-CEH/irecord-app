export default {
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
