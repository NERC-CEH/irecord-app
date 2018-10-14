'use strict'; // eslint-disable-line

module.exports = (taxon, common) => {
  if (!taxon) {
    return null;
  }

  let cleaned = taxon;

  // #Remove ',.*().*,,' - should not have bracketed old Genus
  cleaned = taxon.replace(/\([a-zA-Z0-9\-\.\/\,\s]*\)\s?/g, ''); // eslint-disable-line

  if (common) {
    // #Capitalize first words after comma
    // 'a bird flea' -> 'Bird flea' ('a ' - was removed previously)
    cleaned = taxon.charAt(0).toUpperCase() + taxon.slice(1);
  }

  if (!common) {
    // #remove 'a '
    // line = re.sub('"a ', '"', line)

    // #sensu lato -> s.l.
    // # sensu lato
    // # sensu.lato.
    // # s. lat.
    // # sens. lat.
    // # s.lat.
    // # s. lat.
    // # s.l.
    // # sens.lat.
    cleaned = cleaned.replace(
      /sensu lato|Sensu lato|sensu\.lato\.|s\. lat\.|sens\. lat\.|s\.lat\.|s\. lat\.|sens\.lat\./g,
      's.l.'
    );

    // #sensu stricto -> s.s.
    // # sensu stricto
    // # sens.strict.
    // # sens.str.
    // # s.str.
    // # s. str.
    // # s.s.
    // # sens. str.
    cleaned = cleaned.replace(
      /sensu stricto|sens\.strict\.|sens\.str\.|s\.str\.|s\. str\.|sens\. str\./g,
      's.s.'
    );

    // #sensu -> s.
    cleaned = cleaned.replace(/ sensu\.? /g, ' s. ');

    // #nomen -> nom.
    cleaned = cleaned.replace(/(^|\s)nomen /g, ' nom. ');

    // #non -> n.
    cleaned = cleaned.replace(/ non /g, ' n. ');

    // #misidentification -> misid.
    cleaned = cleaned.replace(/ misidentification| misident./g, ' misid.');

    // #authors -> auth.
    cleaned = cleaned.replace(/ authors/g, ' auth.');

    // #Shorten subsp. to ssp.
    cleaned = cleaned.replace(/subsp\./g, 'ssp.');
  }

  // #todo: remove non alphanumerics
  // [^-_0-9,A-Za-z \.\=\(\)\'\"\/\]\[\s\&aàáâãäåæeèéêëæiìíîïoòóôõöøsßuùúûüyýÿ\+]
  cleaned = cleaned.replace(/(\?|\:|\[|\])/g, ''); // eslint-disable-line

  // #remove spaces
  cleaned = cleaned.replace(/\s{2}/g, ' ');
  cleaned = cleaned.trim();

  return cleaned;
};
