import React from 'react';
import PropTypes from 'prop-types';
import { observer } from 'mobx-react';
import Loader from 'common/Components/Loader';
import './styles.scss';

@observer
class Component extends React.Component {
  render() {
    const { userModel } = this.props;
    const { statistics } = userModel.attrs;
    if (userModel.statistics.synchronizing) {
      return <Loader />;
    }

    if (!statistics.speciesRaw || !statistics.speciesRaw.length) {
      return <span className="empty-stats">No statistics available.</span>;
    }

    const favSpecies = userModel.attrs.statistics.speciesRaw.map(
      species => (
        <ion-item key={species.taxon}>
          <span className="stat">{species.count}</span>
          {species.common || species.taxon}
        </ion-item>
      )
    );

    return (
      <ion-list lines="full">
        <ion-item-divider>{t('Top species')}</ion-item-divider>

        {favSpecies}
      </ion-list>
    );
  }
}

Component.propTypes = {
  userModel: PropTypes.object
};

export default Component;
