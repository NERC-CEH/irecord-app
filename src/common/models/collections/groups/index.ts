import { observable } from 'mobx';
import { Store, Collection } from '@flumens';
import GroupModel from '../../group';
import { groupsStore as store } from '../../store';
import { fetch as fetchGroups } from './service';

type ConstructorOptions = {
  id: string;
  store: Store;
  Model: typeof GroupModel;
};

export class Groups extends Collection<GroupModel> {
  Model = GroupModel;

  _fetchedFirstTime = false;

  fetching = observable({
    isFetching: false,
  });

  constructor(options: ConstructorOptions) {
    super(options);

    this.Model = options.Model;

    const superReset = this.reset;
    // eslint-disable-next-line @getify/proper-arrows/name
    this.reset = async () => {
      // super.reset() doesn't exist, not in the prototype
      superReset.call(this);
      this._fetchedFirstTime = false;
    };
  }

  fetch = async () => {
    if (!this.store || !this.Model) {
      this.ready.resolve(false);
      return;
    }

    const modelsJSON = await this.store.findAll();

    const getModel = (modelJSON: any) =>
      new this.Model({ ...modelJSON, attrs: modelJSON.data });
    const models = modelsJSON.map(getModel);
    this.push(...models);

    this.ready.resolve(true);
  };

  fetchRemote = async () => {
    const remoteDocs = await this._fetchDocs();

    while (this.length) {
      const model = this.pop();
      model?.destroy();
    }

    const initModel = (doc: any) => new this.Model(doc) as GroupModel;
    const newModelsFromRemote = remoteDocs.map(initModel);
    await Promise.all(newModelsFromRemote.map(m => m.save()));
    this.push(...newModelsFromRemote);
  };

  private _fetchDocs = async () => {
    console.log(`📚 Collection: ${this.id} collection fetching`);
    this.fetching.isFetching = true;

    const docs = await fetchGroups({ member: true });

    this.fetching.isFetching = false;

    console.log(
      `📚 Collection: ${this.id} collection fetching done ${docs.length} documents`
    );

    return docs.map(this.Model.parseRemoteJSON);
  };

  resetDefaults = () => {
    const destroyModel = (model: GroupModel) => model.destroy();
    const destroyAllLocations = this.map(destroyModel);
    return Promise.all(destroyAllLocations);
  };
}

const collection = new Groups({
  id: 'groups',
  store,
  Model: GroupModel,
});

export default collection;
