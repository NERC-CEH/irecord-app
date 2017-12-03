const numRanges = {
  1: 665,
  '2-5': 666,
  '6-20': 667,
  '21-100': 668,
  '101-500': 669,
  '500+': 670,
  Present: 671,
};

export default {
  name: 'dragonflies',
  taxonGroups: [107],
  editForm: [
    'occ:adCount',
    'occ:coCount',
    'occ:ovCount',
    'occ:laCount',
    'occ:exCount',
    'occ:emCount',
    'smp:site',
    'smp:siteOther',
    'smp:comment',
  ],

  attrs: {
    smp: {
      site: {
        type: 'radio',
        id: 59,
        label: 'Site type.',
        default: '',
        values: {
          Lake: 672,
          Reservoir: 673,
          'Mill lodge': 674,
          'Large pond': 675,
          'Small pond': 676,
          'Garden pond': 677,
          River: 678,
          Stream: 679,
          Ditch: 680,
          Canal: 681,
          'Other (please specify)': 682,
        },
      },
      siteOther: {
        type: 'text',
        id: 60,
        label: 'Other Site Type',
      },
    },
    occ: {
      adCount: {
        type: 'radio',
        id: 34,
        label: 'Ad.',
        icon: 'number',

        default: '',
        values: numRanges,
      },
      coCount: {
        type: 'radio',
        id: 35,
        label: 'Co.',
        icon: 'number',

        default: '',
        values: numRanges,
      },
      ovCount: {
        type: 'radio',
        id: 36,
        label: 'Ov.',
        icon: 'number',

        default: '',
        values: numRanges,
      },
      laCount: {
        type: 'radio',
        id: 37,
        label: 'La.',
        icon: 'number',

        default: '',
        values: numRanges,
      },
      exCount: {
        type: 'radio',
        id: 38,
        label: 'Ex.',
        icon: 'number',

        default: '',
        values: numRanges,
      },
      emCount: {
        type: 'radio',
        id: 39,
        label: 'Em.',
        icon: 'number',
        default: '',
        values: numRanges,
      },
    },
  },
};
