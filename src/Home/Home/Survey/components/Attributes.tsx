import { observer } from 'mobx-react';
import Badge from '@flumens/tailwind/dist/components/Badge';
import appModel from 'models/app';
import Occurrence from 'models/occurrence';
import StringHelp from 'helpers/string';

type Props = {
  occ?: Occurrence;
};

const Attributes = ({ occ }: Props) => {
  if (!occ) return null;

  let number = StringHelp.limit(occ.data.number);
  if (!number) {
    number = StringHelp.limit(occ.data['number-ranges']);
  }
  const stage = StringHelp.limit(occ.data.stage);
  const { comment } = occ.data;

  const commentLocked = appModel.isAttrLocked(occ, 'comment');
  const numberLocked = appModel.isAttrLocked(occ, 'number');
  const stageLocked = appModel.isAttrLocked(occ, 'stage');

  return (
    <div className="flex flex-nowrap text-xs [&>*:not(:empty)]:mr-2">
      {!!number && (
        <Badge
          size="small"
          className={`text-xs ${numberLocked ? 'locked' : ''}`}
        >
          {number}
        </Badge>
      )}
      {!!stage && (
        <Badge
          size="small"
          className={`text-xs ${stageLocked ? 'locked' : ''}`}
        >
          {stage}
        </Badge>
      )}

      {!!comment && (
        <Badge className={`text-xs ${commentLocked ? 'locked' : ''}`}>
          {comment}
        </Badge>
      )}
    </div>
  );
};

export default observer(Attributes);
