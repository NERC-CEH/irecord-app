import { observer } from 'mobx-react';
import { useRouteMatch } from 'react-router';
import { BlockT } from 'common/flumens';
import Occurrence from 'models/occurrence';
import Sample from 'models/sample';
import MenuAttr from 'Survey/common/Components/MenuAttr';
import MenuLocation from 'Survey/common/Components/MenuLocation';
import MenuTaxonItem from 'Survey/common/Components/MenuTaxonItem';
import './styles.scss';

type Props = {
  survey: string;
  taxa?: string;
  model: Sample | Occurrence;
  block: BlockT;
  useSeparateOccPage?: boolean;
};

const MenuDynamicAttr = ({
  survey,
  taxa,
  model,
  block,
  useSeparateOccPage,
}: Props) => {
  const { url } = useRouteMatch();

  const isOccurrence = model instanceof Occurrence;
  if (!isOccurrence && useSeparateOccPage)
    throw new Error(
      'useSeparateOccPage can only be used with occurrence model.'
    );

  const { id } = block;

  if (id === 'taxon')
    return <MenuTaxonItem key={id} occ={model as Occurrence} />;

  if (id === 'location') {
    return (
      <MenuLocation.WithLock
        key={id}
        sample={model as Sample}
        label={block.title}
        survey={survey}
        taxa={taxa}
      />
    );
  }

  let link = `${url}/${id}`;
  if (useSeparateOccPage) {
    link = `${url}/occ/${model.cid}/${id}`;
  }

  return (
    <MenuAttr.WithLock
      key={id}
      model={model}
      block={block}
      link={link}
      survey={survey}
      taxa={taxa}
    />
  );
};

export default observer(MenuDynamicAttr);
