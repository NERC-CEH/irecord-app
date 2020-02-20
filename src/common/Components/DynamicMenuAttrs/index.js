import React from 'react';
import PropTypes from 'prop-types';
import { observer } from 'mobx-react';
import { IonItem, IonLabel, IonIcon, IonList } from '@ionic/react';
import {
  lock,
  people,
  create,
  personAdd,
  clipboard,
  calendar,
  pin,
  eyeOff,
  business,
} from 'ionicons/icons';
import Toggle from 'Components/Toggle';
import Occurrence from 'occurrence';
import DateHelp from 'helpers/date';
import LocationLabel from './components/LocationLabel';
import 'common/images/number.svg';
import 'common/images/gender.svg';
import 'common/images/land.svg';
import 'common/images/progress-circles.svg';
import './styles.scss';

const icons = {
  number: <IonIcon src="/images/number.svg" slot="start" />,
  stage: <IonIcon src="/images/progress-circles.svg" slot="start" />,
  gender: <IonIcon src="/images/gender.svg" slot="start" />,
  land: <IonIcon src="/images/land.svg" slot="start" />,
  'user-plus': <IonIcon icon={personAdd} slot="start" />,
  comment: <IonIcon icon={clipboard} slot="start" />,
  people: <IonIcon icon={people} slot="start" />,
  calendar: <IonIcon icon={calendar} slot="start" />,
  pin: <IonIcon icon={pin} slot="start" />,
  business: <IonIcon icon={business} slot="start" />,
  eyeOff: <IonIcon icon={eyeOff} slot="start" />,

  generic: <IonIcon icon={create} slot="start" />,
};

@observer
class Component extends React.Component {
  static propTypes = {
    model: PropTypes.object.isRequired,
    onAttrToggle: PropTypes.func,
    appModel: PropTypes.object,
    surveyConfig: PropTypes.object,
    url: PropTypes.string.isRequired,
    useLocks: PropTypes.bool,
    noWrapper: PropTypes.bool,
  };

  getLock = (model, attrName) => {
    const { appModel, useLocks } = this.props;

    if (!useLocks) {
      return null;
    }

    const isLocked = appModel.isAttrLocked(model, attrName);

    return {
      className: isLocked ? 'locked' : '',
      detailIcon: isLocked ? lock : 'ios-arrow-forward',
    };
  };

  // eslint-disable-next-line complexity
  getMenuAttr = (element, surveyConfig) => {
    const { model, onAttrToggle, url } = this.props;

    const isOccurrenceOnly = model instanceof Occurrence;
    const occ = isOccurrenceOnly ? model : model.occurrences[0];

    const attrParts = element.split(':');
    const [attrType, attrName] = attrParts;

    const isSampleAttr = attrType === 'smp';
    const isOccAttr = !isSampleAttr;
    if (isSampleAttr && isOccurrenceOnly) {
      throw new Error('Invalid attibute configuration');
    }

    const selectedModel = isSampleAttr ? model : occ;

    const useOccurrenceWithinSample = !isOccurrenceOnly && isOccAttr;
    const attr = useOccurrenceWithinSample
      ? surveyConfig.occ.attrs[attrName]
      : surveyConfig.attrs[attrName];

    let currentVal;
    switch (element) {
      case 'occ:number':
        currentVal = occ.attrs.number;
        if (!currentVal) {
          currentVal = occ.attrs['number-ranges'];
        }
        break;
      default:
        if (attr.metadata) {
          currentVal = selectedModel.metadata[attrName];
        } else {
          currentVal = selectedModel.attrs[attrName];
        }
    }

    if (currentVal) {
      if (attr.type === 'inputList') {
        currentVal = currentVal.join(', ');
      } else if (attr.type === 'date') {
        currentVal = DateHelp.print(currentVal, true);
      }

      if (attr.displayValueParse) {
        currentVal = attr.displayValueParse(currentVal);
      }
    }

    const { required } = attr;
    const missingRequired = required && !currentVal;

    const label =
      attr.label || attrName.slice(0, 1).toUpperCase() + attrName.slice(1);

    const icon = icons[attr.icon] || icons.generic;

    if (attr.type === 'toggle') {
      if (!onAttrToggle) {
        throw new Error(`onAttrToggle is missing for ${element}`);
      }
      return (
        <IonItem key={element}>
          <IonLabel>{t(label)}</IonLabel>
          <Toggle
            slot="end"
            onToggle={checked => onAttrToggle(element, checked)}
            checked={!!currentVal}
          />
          {icon}
        </IonItem>
      );
    }
    if (attr.type === 'taxon') {
      const specie = occ.attrs.taxon || {};
      // taxon
      const scientificName = specie.scientific_name;
      const commonName =
        specie.found_in_name >= 0 && specie.common_names[specie.found_in_name];

      return (
        <IonItem key={element} detail routerLink={`${url}/taxon`}>
          <IonLabel text-wrap>
            {commonName && (
              <IonLabel className="long" slot="end">
                {commonName}
              </IonLabel>
            )}
            <IonLabel className="long" slot="end">
              <i>{scientificName}</i>
            </IonLabel>
          </IonLabel>
        </IonItem>
      );
    }

    const routerLink =
      attrType === 'occ' && !isOccurrenceOnly
        ? `${url}/occ/${occ.cid}/${attrName}`
        : `${url}/${attrName}`;

    if (attrName === 'location') {
      return (
        <IonItem key={element} routerLink={routerLink} detail>
          <IonIcon icon={pin} slot="start" />
          <IonLabel text-wrap>
            <LocationLabel
              sample={model}
              hideName={attr.hideName}
              required={required}
            />
          </IonLabel>
          <IonLabel slot="start" className="location-label">
            {t(attr.label || 'Location')}
          </IonLabel>
        </IonItem>
      );
    }

    return (
      <IonItem
        key={element}
        routerLink={routerLink}
        id={`${element}-button`}
        detail
        {...this.getLock(selectedModel, attrName)}
      >
        {icon}
        <IonLabel slot="end" className={missingRequired ? 'error' : ''}>
          {missingRequired ? t('Required') : t(currentVal)}
        </IonLabel>
        {t(label)}
      </IonItem>
    );
  };

  render() {
    const { model, noWrapper, surveyConfig } = this.props;
    const config = surveyConfig || model.getSurvey(); // eslint-disable-line
    const { render } = config;
    if (!render) {
      throw new Error('No render found');
    }

    const attributes = render.map(attr => this.getMenuAttr(attr, config));

    if (noWrapper) {
      return attributes;
    }

    return (
      <IonList lines="full" class="attributes-list inputs">
        {attributes}
      </IonList>
    );
  }
}

export default Component;
