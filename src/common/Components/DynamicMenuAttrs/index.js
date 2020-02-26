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

  constructor(props) {
    super(props);

    const { model, surveyConfig } = this.props;
    this.state = { surveyConfig: surveyConfig || model.getSurvey() };
  }

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

  getTaxonAttr = (element, occ, url) => {
    if (!(occ instanceof Occurrence)) {
      throw new Error('Invalid taxon attr configuration');
    }
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
  };

  getAttr = element => {
    const { model } = this.props;

    const [attrType, attrName] = this.getAttrParts(element);

    const isSampleAttr = attrType === 'smp';

    const isOccurrenceOnly = model instanceof Occurrence;

    const isOccAttr = !isSampleAttr;
    const useOccurrenceWithinSample = !isOccurrenceOnly && isOccAttr;

    return useOccurrenceWithinSample
      ? this.state.surveyConfig.occ.attrs[attrName]
      : this.state.surveyConfig.attrs[attrName];
  };

  getAttrParts = element => {
    return element.split(':');
  };

  getIcon = attr => {
    return icons[attr.icon] || icons.generic;
  };

  getLabel = (attr, attrName) => {
    return attr.label || attrName.slice(0, 1).toUpperCase() + attrName.slice(1);
  };

  getToggleAttr = (element, currentVal, attr, attrName) => {
    const { onAttrToggle } = this.props;
    if (!onAttrToggle) {
      throw new Error(`onAttrToggle is missing for ${element}`);
    }

    const icon = this.getIcon(attr);
    const label = this.getLabel(attr, attrName);

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
  };

  getCurrentComplexValue(attr, selectedModel) {
    let value;
    attr.group.forEach(nestedElement => {
      const [, attrName] = this.getAttrParts(nestedElement);

      if (!selectedModel.attrs[attrName]) {
        return;
      }

      value = selectedModel.attrs[attrName];
    });

    return value;
  }

  getCurrentValue = (attr, element, selectedModel, isComplex) => {
    if (isComplex) {
      return this.getCurrentComplexValue(attr, selectedModel);
    }

    const [, attrName] = this.getAttrParts(element);

    let currentVal;
    if (attr.metadata) {
      currentVal = selectedModel.metadata[attrName];
    } else {
      currentVal = selectedModel.attrs[attrName];
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

    return currentVal;
  };

  getLocationAttr = (attr, element, selectedModel) => {
    const { required } = this.getAttr(element);
    const routerLink = this.getRouterLink(element, selectedModel);

    return (
      <IonItem key={element} routerLink={routerLink} detail>
        <IonIcon icon={pin} slot="start" />
        <IonLabel text-wrap>
          <LocationLabel
            sample={selectedModel}
            hideName={attr.hideName}
            required={required}
          />
        </IonLabel>
        <IonLabel slot="start" className="location-label">
          {t(attr.label || 'Location')}
        </IonLabel>
      </IonItem>
    );
  };

  getRouterLink = (element, selectedModel) => {
    const { model, url } = this.props;
    const isOccurrenceOnly = model instanceof Occurrence;

    const [attrType, attrName] = this.getAttrParts(element);

    return attrType === 'occ' && !isOccurrenceOnly
      ? `${url}/occ/${selectedModel.cid}/${attrName}`
      : `${url}/${attrName}`;
  };

  getMenuAttr = element => {
    let complexElement;
    const isComplex = typeof element !== 'string';
    if (isComplex) {
      if (!element.group) {
        throw new Error('No page description found when rendering menu item.');
      }
      complexElement = element;
      element = complexElement.id; // eslint-disable-line
    }

    const [attrType, attrName] = this.getAttrParts(element);

    const { model, url } = this.props;

    const isOccurrenceOnly = model instanceof Occurrence;

    const isSampleAttr = attrType === 'smp';
    if (isSampleAttr && isOccurrenceOnly) {
      throw new Error('Invalid attibute configuration');
    }

    const selectedModel =
      isSampleAttr || isOccurrenceOnly ? model : model.occurrences[0];

    let attr;
    if (isComplex) {
      attr = complexElement;
    } else {
      attr = this.getAttr(element);
    }

    if (attr.type === 'taxon') {
      return this.getTaxonAttr(element, selectedModel, url);
    }

    if (attrName === 'location') {
      return this.getLocationAttr(attr, element, selectedModel);
    }

    const currentVal = this.getCurrentValue(
      attr,
      element,
      selectedModel,
      isComplex
    );

    if (attr.type === 'toggle') {
      return this.getToggleAttr(element, currentVal, attr, attrName);
    }

    const label = this.getLabel(attr, attrName);
    const routerLink = this.getRouterLink(element, selectedModel);
    const isMissingRequired = attr.required && !currentVal;
    const icon = this.getIcon(attr);

    return (
      <IonItem
        key={element}
        routerLink={routerLink}
        id={`${element}-button`}
        detail
        {...this.getLock(selectedModel, attrName)}
      >
        {icon}
        <IonLabel slot="end" className={isMissingRequired ? 'error' : ''}>
          {isMissingRequired ? t('Required') : t(currentVal)}
        </IonLabel>
        {t(label)}
      </IonItem>
    );
  };

  componentDidUpdate() {
    const { model, surveyConfig } = this.props;
    if (surveyConfig) {
      return;
    }

    const newSurveyConfig = model.getSurvey();
    if (this.state.surveyConfig.name !== newSurveyConfig.name) {
      this.setState({ surveyConfig: newSurveyConfig }); // eslint-disable-line
    }
  }

  render() {
    const { noWrapper, model } = this.props;

    let { render } = this.state.surveyConfig;
    if (!render) {
      throw new Error('No render found');
    }

    render = typeof render === 'function' ? render(model) : render;

    const attributes = render.map(this.getMenuAttr);

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
