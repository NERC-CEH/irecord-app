import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { observer } from 'mobx-react';
import {
  IonItemOption,
  IonItemOptions,
  IonItem,
  IonItemSliding,
} from '@ionic/react';
import './styles.scss';

function showGallery() {}

@observer
class index extends Component {
  static propTypes = {
    subSample: PropTypes.object.isRequired,
    onDelete: PropTypes.func.isRequired,
    url: PropTypes.string.isRequired,
  };

  getLocationCommponent = () => {
    const { subSample } = this.props;

    const location = subSample.attrs.location || {};
    const surveylocation = subSample.parent.attrs.location || {};
    const isLocating = subSample.isGPSRunning();
    const locationName = location.name;
    const isCustomLocation = surveylocation.gridref !== location.gridref;
    const locationString = isCustomLocation ? subSample.printLocation() : '';
    let locationComponent;
    if (locationString) {
      if (locationName) {
        locationComponent = <span>{locationName}</span>;
      } else {
        locationComponent = <span>{locationString}</span>;
      }
    } else if (isLocating) {
      locationComponent = <span className=" warn">Locating...</span>;
    } else {
      return null;
    }

    return <div className="location">{locationComponent}</div>;
  };

  render() {
    const { subSample, onDelete, url } = this.props;

    const [occ] = subSample.occurrences;
    const media = occ.media.length && occ.media[0];
    let img = media && media.attrs.thumbnail;

    if (!img) {
      // backwards compatibility
      img = media && media.getURL();
    }
    const specie = occ.attrs.taxon || {};

    // taxon
    const scientificName = specie.scientific_name;

    let commonName =
      specie.found_in_name >= 0 && specie.common_names[specie.found_in_name];

    if (specie.found_in_name === 'common_name') {
      // This is just to be backwards compatible
      // TODO: remove in the next update
      commonName = specie.common_name;
    }

    if (!img) {
      // backwards compatibility
      img = media && media.getURL();
    }

    img = img ? <img src={img} onClick={e => showGallery(e, occ.media)} /> : '';

    return (
      <IonItemSliding key={occ.cid}>
        <IonItem routerLink={`${url}/smp/${subSample.cid}`} detail={false}>
          <div className="photo">{img}</div>

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
