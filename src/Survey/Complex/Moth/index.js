import React from 'react';
import PropTypes from 'prop-types';
import { observer } from 'mobx-react';
import { Route } from 'react-router-dom';
import { IonRouterOutlet } from '@ionic/react';
import Attr from 'Components/AttrPage';
import Show from 'Components/ShowSavedPage';
import Edit from './Edit';
import OccurrencesEdit from './Occurrences/Edit';
import OccurrencesEditTaxon from './Occurrences/Taxon';
import Location from './Location';

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
          render={props => <Edit savedSamples={savedSamples} {...props} />}
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
            `${match.url}/:id/edit/occ/new`,
            `${match.url}/:id/edit/occ/:occId/taxon`,
          ]}
          exact
          render={props => (
            <OccurrencesEditTaxon
              savedSamples={savedSamples}
              appModel={appModel}
              userModel={userModel}
              {...props}
            />
          )}
        />
        <Route
          path={`${match.url}/:id/edit/occ/:occId`}
          exact
          render={props => (
            <OccurrencesEdit
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
          path={`${match.url}/:id/edit/occ/:occId/:attr`}
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
        <Route
          path={`${match.url}/:id/edit/:attr`}
          exact
          render={props => (
            <Attr savedSamples={savedSamples} appModel={appModel} {...props} />
          )}
        />
      </IonRouterOutlet>
    );
  }
}

export default Routes;
