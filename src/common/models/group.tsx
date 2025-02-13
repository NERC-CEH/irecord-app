import { z, object } from 'zod';
import { Model, ModelAttrs, UUIDv7 } from '@flumens';
import { groupsStore } from './store';

export type RemoteAttributes = z.infer<typeof GroupModel.remoteSchema>;

export type Attrs = Omit<RemoteAttributes, 'id' | 'createdOn'> & ModelAttrs;

class GroupModel extends Model<Attrs> {
  static remoteSchema = object({
    id: z.string(),
    title: z.string(),
    createdOn: z.string(),
    description: z.string().nullable().optional(),
    groupType: z.string().nullable().optional(),
    joiningMethod: z.string().nullable().optional(),
    websiteId: z.string().nullable().optional(),
    groupTypeId: z.string().nullable().optional(),
    createdById: z.string().nullable().optional(),
    fromDate: z.string().nullable().optional(),
    toDate: z.string().nullable().optional(),
    indexedLocationIds: z.array(z.number()).nullable().optional(),
  });

  static parseRemoteJSON({ id, createdOn, ...attrs }: RemoteAttributes) {
    return {
      id,
      cid: UUIDv7(),
      attrs,
      createdAt: new Date(createdOn).getTime(),
    };
  }

  constructor(options: any) {
    super({ ...options, store: groupsStore });
  }
}

export default GroupModel;
