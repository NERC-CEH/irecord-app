/** At the moment all disabled because iRecord App 
 * doesn't support other languages than English.
 */

// import dictionary from 'common/data/translations.data';
import appModel from 'app_model';


function translate(key) {
  // TODO: remove this if we have translations
  return key;

  // eslint-disable-next-line
  const language = appModel.get('language');
  const translations = dictionary[key];
  if (!translations) {
    dictionary[key] = { CK: '' };
    console.log(`!new: ${key}`); // TODO: remove
    return key;
  }

  const translated = translations[language];
  if (!translated) {
    return key;
  }

  return translated;
}

window.t = translate;

export default translate;
