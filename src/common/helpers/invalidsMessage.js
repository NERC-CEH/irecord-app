import toast from 'helpers/toast';

export default function showInvalidsMessage({
  attributes,
  samples,
  occurrences,
  models,
}) {
  const getMissingAttributes = attrs => {
    return Object.entries({
      ...attrs,
    })
      .map(([message]) => t(message))
      .join(', ');
  };

  let missing = '';
  const missingAttributes = getMissingAttributes(attributes);

  if (missingAttributes) {
    missing += `<br/>sample: ${missingAttributes}<br/>`;
  }

  const missingOccurrences = Object.entries({
    ...occurrences,
  })
    .map(([id, val]) => getMissingAttributes(val.attributes))
    .join('; ');

  if (missingOccurrences) {
    missing += `<br/>occurrences: ${missingOccurrences}<br/>`;
  }

  const missingSamples = Object.entries({
    ...samples,
  })
    .map(([id, val]) => getMissingAttributes(val.attributes))
    .join('; ');

  if (missingSamples) {
    missing += `<br/>samples: ${missingSamples}<br/>`;
  }

  toast({
    header: t('Some values incorrect or missing:'),
    message: missing,
    color: 'warning',
    duration: 3000,
  });
}
