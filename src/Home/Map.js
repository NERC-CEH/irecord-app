import React from 'react';
import { IonPage, IonLifeCycleContext } from '@ionic/react';
import { observer } from 'mobx-react';
import PropTypes from 'prop-types';
import CONFIG from 'config';
import DateHelp from 'helpers/date';
import L from 'leaflet';
import AppMain from 'Components/Main';
import 'leaflet/dist/images/marker-icon-2x.png';
import 'leaflet/dist/images/marker-shadow.png';
import './styles.scss';

const DEFAULT_CENTER = [53.7326306, -2.6546124];
const MIN_WGS84_ZOOM = 5;
L.Icon.Default.imagePath = '/images';

@observer
class Component extends React.Component {
  static contextType = IonLifeCycleContext;

  static propTypes = {
    savedSamples: PropTypes.array.isRequired,
  };

  constructor(props) {
    super(props);

    this.mapContainer = React.createRef();
  }

  async componentDidMount() {
    this.map = L.map(this.mapContainer.current);
    this.map.setView(DEFAULT_CENTER, MIN_WGS84_ZOOM);

    const layer = L.tileLayer(
      'https://api.mapbox.com/styles/v1/{id}/tiles/256/{z}/{x}/{y}?access_token={accessToken}',
      {
        attribution:
          '<a href="http://mapbox.com/about/maps" class="mapbox-wordmark" target="_blank">Mapbox</a> © <a href="https://www.mapbox.com/about/maps/">Mapbox</a> © <a href="https://www.maxar.com/">Maxar</a> © <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> <strong><a href="https://www.mapbox.com/map-feedback/" target="_blank">Improve this map</a></strong>',
        id: CONFIG.map.mapbox_satellite_id,
        accessToken: CONFIG.map.mapbox_api_key,
        tileSize: 256, // specify as, OS layer overwites this with 200 otherwise,
        minZoom: MIN_WGS84_ZOOM,
      }
    );
    this.map.attributionControl.setPrefix('');

    layer.addTo(this.map);
    this.addRecords();

    this.context.onIonViewDidEnter(() => {
      this.map.whenReady(() => {
        this.map.invalidateSize();
        this.zoomToRecords();
      });
    });
  }

  addRecords = () => {
    const { savedSamples } = this.props;
    savedSamples.forEach(sample => {
      const { latitude, longitude } = sample.attrs.location;
      if (!latitude) {
        return;
      }

      const survey = sample.getSurvey();

      const marker = L.circleMarker([latitude, longitude], {
        color: 'white',
        fillColor: survey.complex ? '#a77d11' : '#ada400',
        fillOpacity: 1,
        weight: 4,
      });

      this.addRecordsPopup(sample, survey, marker);
      marker.addTo(this.map);
    });
  };

  addRecordsPopup = (sample, { complex, label }, marker) => {
    const date = DateHelp.print(sample.attrs.date, true);
    let surveyInfo = '';
    if (complex) {
      surveyInfo = `<br/>${label} Survey`;
    }

    let speciesInfo = '';
    if (complex) {
      speciesInfo = `<br/>Species: ${sample.samples.length}`;
    } else {
      const species = sample.occurrences[0].attrs.taxon;
      const name =
        species.found_in_name >= 0
          ? species.common_names[species.found_in_name]
          : species.scientific_name;

      speciesInfo = `<br/>${name}`;
    }

    // let href;
    // const isSent = sample.metadata.server_on;
    // if (!sample.synchronising) {
    //   const allowEdit = !isSent;
    //   if (complex) {
    //     href = allowEdit
    //       ? `/survey/complex/${name}/${sample.cid}/edit`
    //       : `/survey/complex/${name}/${sample.cid}/show`;
    //   } else {
    //     href = allowEdit
    //       ? `/survey/default/${sample.cid}/edit`
    //       : `/survey/default/${sample.cid}/show`;
    //   }
    // }

    marker.bindPopup(`<b>${date}</b>${surveyInfo}${speciesInfo}`);
  };

  zoomToRecords() {
    const { savedSamples } = this.props;

    const positions = savedSamples.reduce((agg, sample) => {
      const { latitude, longitude } = sample.attrs.location;
      if (!latitude) {
        return agg;
      }
      return [...agg, [latitude, longitude]];
    }, []);

    if (!positions.length) {
      return;
    }

    this.map.fitBounds(positions);
  }

  render() {
    return (
      <IonPage id="surveys-map">
        <AppMain ref={this.mapContainer} />
      </IonPage>
    );
  }
}

export default Component;
