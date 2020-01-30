import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { observer } from 'mobx-react';
import {
  IonItemOption,
  IonItemOptions,
  IonItem,
  IonIcon,
  IonItemSliding,
  IonButton,
} from '@ionic/react';
import { alert } from 'ionicons/icons';
import './styles.scss';

@observer
class index extends Component {
  static propTypes = {
    occ: PropTypes.object.isRequired,
    increaseCount: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired,
    url: PropTypes.string.isRequired,
  };

  getIncrementButton = occ => {
    const { increaseCount } = this.props;

    const onNumberIncrementClick = e => {
      e.preventDefault();
      e.stopPropagation();

      increaseCount(occ);
    };

    return (
      <IonButton
        class="count-edit-count"
        onClick={onNumberIncrementClick}
        fill="clear"
      >
        {occ.attrs.number}
      </IonButton>
    );
  };

  render() {
    const { occ, onDelete, url } = this.props;
    const survey = occ.getSurvey();
    const invalids = survey.verify(occ.attrs);
    const isValid = _.isEmpty(invalids);

    const specie = occ.attrs.taxon || {};
    const scientificName = specie.scientific_name;
    let commonName =
      specie.found_in_name >= 0 && specie.common_names[specie.found_in_name];

    if (specie.found_in_name === 'common_name') {
      // This is just to be backwards compatible
      // TODO: remove in the next update
      commonName = specie.common_name;
    }

    return (
      <IonItemSliding key={occ.cid}>
        <IonItem routerLink={`${url}/occ/${occ.cid}`} detail={false}>
          {this.getIncrementButton(occ)}

          <div className="details">
            {commonName && (
              <>
                <div className="species">{commonName}</div>
                <div className="species scientific">{scientificName}</div>
              </>
            )}
            {!commonName && (
              <div className="species">
                <i>
                  <b>{scientificName}</b>
                </i>
              </div>
            )}
          </div>
          {!isValid && <IonIcon icon={alert} color="danger" slot="end" />}
        </IonItem>
        <IonItemOptions side="end">
          <IonItemOption color="danger" onClick={onDelete}>
            {t('Delete')}
          </IonItemOption>
        </IonItemOptions>
      </IonItemSliding>
    );
  }
}

export default index;
