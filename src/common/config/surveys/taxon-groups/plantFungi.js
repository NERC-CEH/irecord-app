export default {
  name: 'plants-fungi',
  taxonGroups: [
    89,
    78,
    87,
    99,
    81,
    148,
    // 133,
    // 129,

    92, // fungi
  ],

  render(model) {
    const group = ['occ:number', 'occ:number-ranges'];
    const getTopParent = m => (m.parent ? getTopParent(m.parent) : m);
    const topParent = getTopParent(model);
    if (topParent.metadata.complex_survey) {
      group.splice(1, 0, 'occ:numberDAFOR');
    }

    return [
      {
        id: 'occ:number',
        label: 'Abundance',
        icon: 'number',
        info: 'How many individuals of this type?',
        group,
      },

      'occ:stage',
      'occ:sex',
      'occ:identifiers',
    ];
  },

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
      number: {
        id: 16,
        label: 'Abundance',
        icon: 'number',
        type: 'slider',
        incrementShortcut: true,
      },
      'number-ranges': {
        id: 523,
        default: 'Present',
        type: 'radio',
        values: {
          1: 665,
          '2-5': 666,
          '6-20': 667,
          '21-100': 668,
          '101-500': 669,
          '500+': 670,
        },
      },
    },
  },
};
