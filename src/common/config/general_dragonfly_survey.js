const numRanges = {
  1: 665,
  '2-5': 666,
  '6-20': 667,
  '21-100': 668,
  '101-500': 669,
  '500+': 670,
  Present: 671,
};
// eslint-disable-next-line
const dragonflies = {
  sample: {
    site: {
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
  occurrence: {
    Ad: {
      id: 34,
      label: 'Ad.',
      default: '',
      values: numRanges,
    },
    Co: {
      id: 35,
      label: 'Co.',
      default: '',
      values: numRanges,
    },
    Ov: {
      id: 36,
      label: 'Ov.',
      default: '',
      values: numRanges,
    },
    La: {
      id: 37,
      label: 'La.',
      default: '',
      values: numRanges,
    },
    Ex: {
      id: 38,
      label: 'Ex.',
      default: '',
      values: numRanges,
    },
    Em: {
      id: 39,
      label: 'Em.',
      default: '',
      values: numRanges,
    },
  },
};
