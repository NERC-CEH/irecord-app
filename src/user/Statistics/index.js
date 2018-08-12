import React from 'react';
import PropTypes from 'prop-types';
import { observer } from 'mobx-react';
import './styles.scss';

@observer
class Component extends React.Component {
  render() {
    const { userModel } = this.props;
    const { statistics } = userModel.attributes;
    if (userModel.metadata.synchronizingStatistics) {
      return <ion-spinner class="centered" />;
    }

    if (!statistics.speciesRaw || !statistics.speciesRaw.length) {
      return;
    }

    const favSpecies = userModel.attributes.statistics.speciesRaw.map(
      species => {
        return (
          <ion-item key={species.taxon}>
            <span className="stat">{species.count}</span>
            {species.common || species.taxon}
          </ion-item>
        );
      }
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
  userModel: PropTypes.object,
};

export default Component;
