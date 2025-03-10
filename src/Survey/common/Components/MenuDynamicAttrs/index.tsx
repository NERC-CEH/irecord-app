import { observer } from 'mobx-react';
import { useRouteMatch } from 'react-router';
import Occurrence from 'models/occurrence';
import Sample from 'models/sample';
import MenuAttr from 'Survey/common/Components/MenuAttr';
import MenuLocation from 'Survey/common/Components/MenuLocation';
import MenuTaxonItem from 'Survey/common/Components/MenuTaxonItem';
import './styles.scss';

type Model = Sample | Occurrence;

type Props = {
  model: Model;
  surveyConfig?: any;
  skipLocks?: boolean;
};

const MenuDynamicAttrs = ({
  model,
  surveyConfig: surveyConfigProp,
  skipLocks,
}: Props) => {
  const { url } = useRouteMatch();

  const surveyConfig = surveyConfigProp || model.getSurvey();
  const getTaxonAttr = (element: any, occ: Occurrence) => {
    if (!(occ instanceof Occurrence)) {
      throw new Error('Invalid taxon attr configuration');
    }

    return <MenuTaxonItem key={element} occ={occ} />;
  };

  const getAttrParts = (element: any) => {
    return element.split(':');
  };

  const getRouterLink = (el: any, m: Model) => {
    const isOccurrenceOnly = model instanceof Occurrence;

    const [attrType, attrName] = getAttrParts(el);

    return attrType === 'occ' && !isOccurrenceOnly
      ? `${url}/occ/${m.cid}/${attrName}`
      : `${url}/${attrName}`;
  };

  const getLocationAttr = (
    key: string,
    selectedModel: Model,
    attrConfig: any
  ) => {
    return (
      <MenuLocation.WithLock
        key={key}
        sample={selectedModel as Sample}
        skipLocks={skipLocks}
        label={attrConfig.menuProps?.label}
      />
    );
  };

  const getMenuAttr = (element: any) => {
    let complexElement;
    const isComplex = typeof element !== 'string';
    if (isComplex) {
      if (!element.group) {
        throw new Error('No page description found when rendering menu item.');
      }
      complexElement = element;
      element = complexElement.id; // eslint-disable-line
    }

    const [attrType, attrName] = getAttrParts(element);

    const isOccurrenceOnly = model instanceof Occurrence;

    const isSampleAttr = attrType === 'smp';
    if (isSampleAttr && isOccurrenceOnly) {
      throw new Error('Invalid attibute configuration');
    }

    const selectedModel =
      isSampleAttr || isOccurrenceOnly ? model : model.occurrences[0];

    if (attrName === 'taxon')
      return getTaxonAttr(element, selectedModel as Occurrence);

    if (attrName === 'location') {
      const attrConfig = surveyConfig.attrs[attrName];
      return getLocationAttr(element, selectedModel, attrConfig);
    }

    const routerLink = getRouterLink(element, selectedModel);

    if (skipLocks)
      return (
        <MenuAttr
          key={element}
          model={selectedModel}
          attr={attrName}
          className="menu-attr-item"
          itemProps={{ routerLink }}
        />
      );

    return (
      <MenuAttr.WithLock
        key={element}
        model={selectedModel}
        attr={attrName}
        itemProps={{ routerLink }}
      />
    );
  };

  let { render } = surveyConfig;
  if (!render) return null; // remote fetched surveys will not have it

  render = typeof render === 'function' ? render(model) : render;
  const attributes = render.map(getMenuAttr);

  return attributes;
};

export default observer(MenuDynamicAttrs);
