module.exports = (taxon, common, genus) => {
  const cleaned = taxon.replace(/\([a-zA-Z]+\)/g, '').trim();
  return cleaned;
};

// #Clean the master list from '[]'
// line = re.sub('\[.*\]\s', '', line)
//
// #Remove ',.*().*,,' - should not have bracketed old Genus
// line = re.sub('([0-9]+,[0-9]+,\".*) \(.*\)(.*)', r'\1\2', line)
//
// #todo: remove non alphanumerics
// line = re.sub('[^-_0-9,A-Za-z \.\=\(\)\'\"\/]', '', line)
//
// #remove 'a '
// line = re.sub('"a ', '"', line)
//
// #remove trailing and double spaces
// line = re.sub(' \"', '"', line)
// line = re.sub('  ', ' ', line)
//
// #sensu stricto -> s.s.
// # sensu stricto
// # sens.strict.
// # sens.str.
// # s.str.
// # s. str.
// # s.s.
// # sens. str.
//   line = re.sub('sensu stricto|sens\.strict\.|sens\.str\.|s\.str\.|s\. str\.|sens\. str\.', 's.s.', line)
//
// #sensu lato -> s.l.
// # sensu lato
// # sensu.lato.
// # s. lat.
// # sens. lat.
// # s.lat.
// # s. lat.
// # s.l.
// # sens.lat.
//   line = re.sub('sensu lato|Sensu lato|sensu\.lato\.|s\. lat\.|sens\. lat\.|s\.lat\.|s\. lat\.|sens\.lat\.', 's.l.', line)
//
// #sensu -> s.
//   line = re.sub(' sensu\.? ', ' s. ', line)
//
// #nomen -> nom.
//   line = re.sub(' nomen ', ' nom. ', line)
//
// #non -> n.
// # line = re.sub(' non ', ' n. ', line)
//
// #misidentification -> misid.
//   line = re.sub(' misidentification| misident.', ' misid.', line)
//
// #authors -> auth.
//   line = re.sub(' authors', ' auth.', line)
//
// #Capitalize first words after comma 'a bird flea' -> 'Bird flea' ('a ' - was removed previously)
// line = re.sub(',\"([a-z])', lambda match: ',"' + match.group(1).upper(), line)
//
// #Shorten subsp. to ssp.
//   line = re.sub('subsp\.', 'ssp.', line)
// print(line)