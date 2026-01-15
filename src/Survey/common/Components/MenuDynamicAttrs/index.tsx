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

  const isOccurrenceOnly = model instanceof Occurrence;
  const isSampleAttr = config.model === 'sample';

  // handle complex elements with group property
  const hasGroup = 'group' in config && config.group;
  if (hasGroup && !Array.isArray(config.group))
    throw new Error('No page description found when rendering menu item.');

  if (isSampleAttr && isOccurrenceOnly)
    throw new Error('Invalid attribute configuration');

  const selectedModel =
    isSampleAttr || isOccurrenceOnly ? model : model.occurrences[0];

  if (config.id === 'taxon')
    return <MenuTaxonItem key={config.id} occ={selectedModel as Occurrence} />;

  if (config.id === 'location')
    return (
      <MenuLocation.WithLock
        key={config.id}
        sample={selectedModel as Sample}
        skipLocks={skipLocks}
        label={config.menuProps?.label}
      />
    );

  let routerLink = `${url}/${config.id}`;
  const isOnSampleEditPageButPointToOcc = !isSampleAttr && !isOccurrenceOnly;
  if (isOnSampleEditPageButPointToOcc) {
    routerLink = `${url}/occ/${selectedModel.cid}/${config.id}`;
  }

  if (skipLocks)
    return (
      <MenuAttr
        key={config.id}
        model={selectedModel}
        attr={config.id}
        className="menu-attr-item"
        itemProps={{ routerLink }}
      />
    );

  return (
    <MenuAttr.WithLock
      key={config.id}
      model={selectedModel}
      attr={config.id}
      itemProps={{ routerLink }}
    />
  );
};

export default observer(MenuDynamicAttr);
