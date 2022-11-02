import React from 'react';
import PropTypes from 'prop-types';
import { observer } from 'mobx-react';
import { Route } from 'react-router-dom';
import { IonRouterOutlet } from '@ionic/react';
import Attr from 'Components/AttrPage';
import Show from 'Components/ShowSavedPage';
import Edit from './Edit';
import SamplesEdit from './Samples/Edit';
import SamplesEditTaxon from './Samples/Taxon';
import SamplesEditLocation from './Samples/Location';
import Location from './Location';
import Activity from '../../common/Activity';

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
      <IonRouterOutlet class="complex-survey">
        <Route
          path={`${match.url}/new`}
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
          path={[
            `${match.url}/:id/edit/smp/new`,
            `${match.url}/:id/edit/smp/:smpId/taxon`,
          ]}
          exact
          render={props => (
            <SamplesEditTaxon
              savedSamples={savedSamples}
              appModel={appModel}
              userModel={userModel}
              {...props}
            />
          )}
        />
        <Route
          path={`${match.url}/:id/edit/smp/:smpId`}
          exact
          render={props => (
            <SamplesEdit
              savedSamples={savedSamples}
              appModel={appModel}
              userModel={userModel}
              {...props}
            />
          )}
        />
        <Route
          path={`${match.url}/:id/edit/smp/:smpId/location`}
          exact
          render={props => (
            <SamplesEditLocation
              savedSamples={savedSamples}
              appModel={appModel}
              userModel={userModel}
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
          path={[
            `${match.url}/:id/edit/smp/:smpId/:attr`,
            `${match.url}/:id/edit/smp/:smpId/occ/:occId/:attr`,
          ]}
          exact
          render={props => (
            <Attr
              savedSamples={savedSamples}
              appModel={appModel}
              userModel={userModel}
              useLocks
              {...props}
            />
          )}
        />
        <Route
          path={`${match.url}/:id/edit/:attr`}
          exact
          render={props => (
            <Attr
              savedSamples={savedSamples}
              appModel={appModel}
              userModel={userModel}
              {...props}
            />
          )}
        />
      </IonRouterOutlet>
    );
  }
}

export default Routes;
