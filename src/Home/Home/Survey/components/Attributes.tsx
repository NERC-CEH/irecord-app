import { observer } from 'mobx-react';
import Badge from '@flumens/tailwind/dist/components/Badge';
import { getPrettyBlockValue } from '@flumens/tailwind/dist/components/Block';
import { limit } from 'common/flumens';
import Occurrence from 'models/occurrence';

type Props = {
  occ?: Occurrence;
};

const Attributes = ({ occ }: Props) => {
  if (!occ) return null;

  const survey = occ.parent!.getSurvey();
  const render = survey.occ?.render;
  const blocks = typeof render === 'function' ? render(occ) : render || [];
  const getAttribute = (title: string) => {
    const block = blocks.find(attr => attr.title === title);
    const rawValue =
      block?.type === 'group' ? occ.data : occ.data[block?.id || ''];
    return {
      block,
      value: block && limit(getPrettyBlockValue(rawValue, block)),
    };
  };

  const number = getAttribute('Abundance');
  const stage = getAttribute('Stage');
  const { comment } = occ.data;

  return (
    <div className="flex flex-nowrap text-xs [&>*:not(:empty)]:mr-2">
      {!!number.value && (
        <Badge size="small" className="text-xs">
          {number.value}
        </Badge>
      )}
      {!!stage.value && (
        <Badge size="small" className="text-xs">
          {stage.value}
        </Badge>
      )}

      {!!comment && <Badge className="text-xs">{comment}</Badge>}
    </div>
  );
};

export default observer(Attributes);
