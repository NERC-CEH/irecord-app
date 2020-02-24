export default {
  name: 'plants',
  taxonGroups: [89, 78, 87, 99, 81, 148, 133, 129],

  attrs: {},
  occ: {
    attrs: {
      numberDAFOR: {
        type: 'radio',
        id: 2,
        values: {
          Dominant: 1,
          Abundant: 2,
          Frequent: 3,
          Occasional: 4,
          Rare: 5,
        },
      },
    },
  },
};
