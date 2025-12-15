import { observer } from 'mobx-react';
import { useRouteMatch } from 'react-router';
import Occurrence from 'models/occurrence';
import Sample from 'models/sample';
import MenuAttr from 'Survey/common/Components/MenuAttr';
import MenuLocation from 'Survey/common/Components/MenuLocation';
import MenuTaxonItem from 'Survey/common/Components/MenuTaxonItem';
import { AttrConfig } from 'Survey/common/config';
import './styles.scss';

type Model = Sample | Occurrence;

type Props = {
  model: Model;
  config: AttrConfig | string | any;
  skipLocks?: boolean;
};

const MenuDynamicAttr = ({ model, config, skipLocks }: Props) => {
  const { url } = useRouteMatch();

  const getTaxonAttr = (attrConfig: AttrConfig, occ: Occurrence) => {
    if (!(occ instanceof Occurrence)) {
      throw new Error('Invalid taxon attr configuration');
    }

    return <MenuTaxonItem key={attrConfig.id} occ={occ} />;
  };

  const getRouterLink = (attrConfig: AttrConfig, m: Model) => {
    const isOccurrenceOnly = model instanceof Occurrence;
    const isSampleAttr = attrConfig.model === 'sample';

    return isSampleAttr && !isOccurrenceOnly
      ? `${url}/${attrConfig.id}`
      : `${url}/occ/${m.cid}/${attrConfig.id}`;
  };

  const getLocationAttr = (attrConfig: AttrConfig, selectedModel: Model) => {
    return (
      <MenuLocation.WithLock
        key={attrConfig.id}
        sample={selectedModel as Sample}
        skipLocks={skipLocks}
        label={attrConfig.menuProps?.label}
      />
    );
  };

  // handle AttrConfig objects
  const attrConfig = config;

  // handle complex elements with group property
  const hasGroup = 'group' in attrConfig && attrConfig.group;
  if (hasGroup && !Array.isArray(attrConfig.group)) {
    throw new Error('No page description found when rendering menu item.');
  }

  const isOccurrenceOnly = model instanceof Occurrence;
  const isSampleAttr = attrConfig.model === 'sample';

  if (isSampleAttr && isOccurrenceOnly) {
    throw new Error('Invalid attribute configuration');
  }

  const selectedModel =
    isSampleAttr || isOccurrenceOnly ? model : model.occurrences[0];

  if (attrConfig.id === 'taxon')
    return getTaxonAttr(attrConfig, selectedModel as Occurrence);

  if (attrConfig.id === 'location') {
    return getLocationAttr(attrConfig, selectedModel);
  }

  const routerLink = getRouterLink(attrConfig, selectedModel);

  if (skipLocks)
    return (
      <MenuAttr
        key={attrConfig.id}
        model={selectedModel}
        attr={attrConfig.id}
        className="menu-attr-item"
        itemProps={{ routerLink }}
      />
    );

  return (
    <MenuAttr.WithLock
      key={attrConfig.id}
      model={selectedModel}
      attr={attrConfig.id}
      itemProps={{ routerLink }}
    />
  );
};

export default observer(MenuDynamicAttr);
