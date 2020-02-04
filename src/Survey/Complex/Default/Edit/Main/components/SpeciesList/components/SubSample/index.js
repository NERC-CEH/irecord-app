import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { observer } from 'mobx-react';
import {
  IonItemOption,
  IonItemOptions,
  IonItem,
  IonItemSliding,
  IonButton,
} from '@ionic/react';
import './styles.scss';

@observer
class index extends Component {
  static propTypes = {
    subSample: PropTypes.object.isRequired,
    increaseCount: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired,
    url: PropTypes.string.isRequired,
  };

  getLocationCommponent = () => {
    const { subSample } = this.props;

    const location = subSample.attrs.location || {};
    const surveylocation = subSample.parent.attrs.location || {};
    const isLocating = subSample.isGPSRunning();
    const isCustomLocation = surveylocation.gridref !== location.gridref;

    const locationString = isCustomLocation ? subSample.printLocation() : '';
    let locationComponent;
    if (locationString) {
      locationComponent = <span>{locationString}</span>;
    } else if (isLocating) {
      locationComponent = <span className=" warn">Locating...</span>;
    } else {
      return null;
    }

    return <div className="location">{locationComponent}</div>;
  };

  getIncrementButton = occ => {
    const { subSample, increaseCount } = this.props;

    const survey = subSample.getSurvey();
    const incrementShortcut =
      survey.occ.attrs.number && survey.occ.attrs.number.incrementShortcut;

    const { number } = occ.attrs;

    if (!incrementShortcut || !number || Number.isNaN(number)) {
      return (
        <IonButton className="count-edit-count no-number" fill="clear">
          N/A
        </IonButton>
      );
    }

    const onNumberIncrementClick = e => {
      e.preventDefault();
      e.stopPropagation();

      increaseCount(occ);
    };

    return (
      <IonButton
        class={`count-edit-count ${!number ? 'no-number' : ''}`}
        onClick={onNumberIncrementClick}
        fill="clear"
      >
        {number}
      </IonButton>
    );
  };

  render() {
    const { subSample, onDelete, url } = this.props;

    const [occ] = subSample.occurrences;

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
        <IonItem routerLink={`${url}/smp/${subSample.cid}`} detail={false}>
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

            {this.getLocationCommponent()}
          </div>
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
