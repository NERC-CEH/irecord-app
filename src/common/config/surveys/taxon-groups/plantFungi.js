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
        type: 'radio',
        values: [
          { value: null, isDefault: true, label: 'Present' },
          { value: 1, id: 665 },
          { value: '2-5', id: 666 },
          { value: '6-20', id: 667 },
          { value: '21-100', id: 668 },
          { value: '101-500', id: 669 },
          { value: '500+', id: 670 },
        ],
      },
    },
  },
};
