const responses = {
  DUPLICATE(data) {
    const resp = {
      errors: [
        {
          id: Math.random(),
          external_key: data.occurrence_cid,
          sample_id: Math.random(),
          sample_external_key: data.cid,
          title: 'Occurrence already exists.',
        },
      ],
    };

    return [409, resp];
  },

  // model -> type
  // children -> occurrences
  // struct -> data
  OK(data) {
    const resp = {
      data: {
        type: 'sample',
        id: Math.random(),
        external_key: data.cid,
        occurrences: [
          {
            type: 'occurrence',
            id: Math.random(),
            external_key: data.occurrence_cid,
          },
        ],
      },
    };

    return [200, resp];
  },

  OK_SUBSAMPLE(data) {
    const resp = {
      data: {
        type: 'sample',
        id: Math.random(),
        external_key: data.cid,
        samples: [
          {
            type: 'sample',
            id: Math.random(),
            external_key: data.subsample_cid,
            occurrences: [
              {
                type: 'occurrence',
                id: Math.random(),
                external_key: data.occurrence_cid,
              },
            ],
          },
        ],
      },
    };

    return [200, resp];
  },

  ERR() {
    return [502, {}];
  },
};

export default function(functionName, data) {
  const func = responses[functionName];
  if (!func) {
    throw new Error('No such return function');
  }
  const [code, resp] = func(data);
  return [code, { 'Content-Type': 'application/json' }, JSON.stringify(resp)];
}
