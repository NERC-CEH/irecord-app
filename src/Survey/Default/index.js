import React from 'react';
import PropTypes from 'prop-types';
import { observer } from 'mobx-react';
import { Route } from 'react-router-dom';
import { IonRouterOutlet } from '@ionic/react';
import Attr from 'Components/AttrPage';
import Show from 'Components/ShowSavedPage';
import Edit from './Edit';
import Taxon from './Taxon';
import Location from './Location';
import PastLocations from './PastLocations';
import Activity from './Activity';

@observer
class Routes extends React.Component {
  static propTypes = {
    savedSamples: PropTypes.array.isRequired,
    match: PropTypes.object,
    history: PropTypes.object,
    appModel: PropTypes.object.isRequired,
    userModel: PropTypes.object.isRequired,
  };

  render() {
    const { savedSamples, appModel, userModel, match } = this.props;

    return (
      <IonRouterOutlet>
        <Route
          path={`${match.url}/new`}
          exact
          render={props => (
            <Taxon
              savedSamples={savedSamples}
              userModel={userModel}
              appModel={appModel}
              {...props}
            />
          )}
        />
        <Route
          path={`${match.url}/:id/show`}
          exact
          render={props => (
            <Show
              savedSamples={savedSamples}
              appModel={appModel}
              userModel={userModel}
              {...props}
            />
          )}
        />
        <Route
          path={`${match.url}/:id/edit`}
          exact
          render={props => (
            <Edit
              savedSamples={savedSamples}
              appModel={appModel}
              userModel={userModel}
              {...props}
            />
          )}
        />
        <Route
          path={`${match.url}/:id/edit/taxa`}
          exact
          render={props => (
            <Taxon
              savedSamples={savedSamples}
              userModel={userModel}
              appModel={appModel}
              {...props}
            />
          )}
        />
        <Route
          path={`${match.url}/:id/edit/activity`}
          exact
          render={props => (
            <Activity
              savedSamples={savedSamples}
              appModel={appModel}
              userModel={userModel}
              {...props}
            />
          )}
        />
        <Route
          path={`${match.url}/:id/edit/location`}
          exact
          render={props => (
            <Location
              savedSamples={savedSamples}
              appModel={appModel}
              {...props}
            />
          )}
        />
        <Route
          path={`${match.url}/:id/edit/location/past`}
          exact
          render={props => (
            <PastLocations
              savedSamples={savedSamples}
              appModel={appModel}
              {...props}
            />
          )}
        />
        <Route
          path={[
            `${match.url}/:id/edit/occ/:occId/:attr`,
            `${match.url}/:id/edit/:attr`,
          ]}
          exact
          render={props => (
            <Attr
              savedSamples={savedSamples}
              appModel={appModel}
              useLocks
              {...props}
            />
          )}
        />
      </IonRouterOutlet>
    );
  }
}

export default Routes;
