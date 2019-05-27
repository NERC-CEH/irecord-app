import Backbone from 'backbone';
import appModel from 'app_model';
import Log from 'helpers/log';
import { observer } from 'mobx-react';
import PropTypes from 'prop-types';
import React from 'react';
import radio from 'radio';
import Device from 'helpers/device';
import DateHelp from 'helpers/date';
import StringHelp from 'helpers/string';
import Marionette from 'backbone.marionette';
import Icon from 'common/Components/Icon';
import template from './past_location_edit.tpl';
import './styles.scss';

/**
 * Sort the past locations placing favourites to the top.
 */
const sortFavLocationsToTop = (a, b) =>
  a.favourite === b.favourite ? 0 : a.favourite ? -1 : 1; // eslint-disable-line

function showEditPopup(location) {
  const locationModel = new Backbone.Model(Object.assign({}, location));
  const EditView = Marionette.View.extend({
    template,
    getValues() {
      return {
        name: StringHelp.escape(this.$el.find('#location-name').val()),
        favourite: this.$el.find('#favourite-btn').prop('checked'),
      };
    },

    onAttach() {
      const $input = this.$el.find('#location-name');
      $input.focus();
      if (window.cordova && Device.isAndroid()) {
        window.Keyboard.show();
        $input.focusout(() => {
          window.Keyboard.hide();
        });
      }
    },
  });

  const editView = new EditView({ model: locationModel });

  radio.trigger('app:dialog', {
    title: 'Edit Location',
    body: editView,
    buttons: [
      {
        title: 'Cancel',
        fill: 'clear',
        onClick() {
          radio.trigger('app:dialog:hide');
        },
      },
      {
        title: 'Save',
        onClick() {
          // update location
          const locationEdit = editView.getValues();
          appModel.setLocation(locationModel.set(locationEdit).toJSON());
          radio.trigger('app:dialog:hide');
        },
      },
    ],
  });
}

function showDeletePopup() {
  return new Promise(resolve => {
    radio.trigger('app:dialog', {
      title: 'Delete Location',
      body: 'Are you sure you want to delete the location?',
      buttons: [
        {
          title: 'Cancel',
          fill: 'clear',
          onClick() {
            radio.trigger('app:dialog:hide');
            resolve();
          },
        },
        {
          title: 'Delete',
          color: 'danger',
          onClick() {
            radio.trigger('app:dialog:hide');
            resolve(true);
          },
        },
      ],
    });
  });
}

@observer
class Component extends React.Component {
  constructor(props) {
    super(props);
    this.listRef = React.createRef();
  }

  deleteLocation(locationId) {
    Log('Settings:Locations:Controller: deleting location.');
    showDeletePopup().then(doDelete => {
      if (doDelete) {
        appModel.removeLocation(locationId);
      }
    });
    this.listRef.current.closeSlidingItems();
  }

  editLocation(locationId) {
    Log('Settings:Locations:Controller: editing location.');
    const location = this.props.locations.filter(loc => loc.id === locationId);
    showEditPopup(location[0]);
    this.listRef.current.closeSlidingItems();
  }

  selectLocation(locationId) {
    if (!this.props.onSelect) {
      return;
    }
    const location = this.props.locations.filter(loc => loc.id === locationId);
    const locationCopy = Object.assign({}, location[0]);
    delete locationCopy.id;
    delete locationCopy.favourite;
    delete locationCopy.date;
    this.props.onSelect(locationCopy);
  }

  componentWillUnmount() {
    if (this.listRef.current) {
      this.listRef.current.closeSlidingItems();
    }
  }

  render() {
    function getPastLocations() {
      if (!this.props.locations || !this.props.locations.length) {
        return (
          <div className="empty">
            <Icon i="location" />
            <h6>{t('You have no previous locations.')}</h6>
          </div>
        );
      }

      const locations = [...this.props.locations];

      function getPastLocation(location) {
        const locationStr = appModel.printLocation(location);
        const { id, name, favourite, source, date } = location;
        const dateStr = date ? DateHelp.print(date, true) : '';

        return (
          <ion-item-sliding key={id}>
            <ion-item>
              <div className="location" onClick={() => this.selectLocation(id)}>
                {name ? <strong>{name}</strong> : ''}
                <p>{locationStr}</p>
                <span
                  className={`location-favourite icon icon-star ${
                    favourite ? 'on' : ''
                  }`}
                />
                <span className="location-date">{dateStr}</span>
                <span className="location-source">
                  {t('source')}
:
                  {t(source)}
                </span>
              </div>
            </ion-item>

            <ion-item-options side="end">
              <ion-item-option
                color="danger"
                onClick={() => this.deleteLocation(id)}
              >
                <div className="edit icon icon-delete" />
              </ion-item-option>
              <ion-item-option onClick={() => this.editLocation(id)}>
                <div className="edit icon icon-edit" />
              </ion-item-option>
            </ion-item-options>
          </ion-item-sliding>
        );
      }
      const formattedLocations = locations
        .sort(sortFavLocationsToTop)
        .map(getPastLocation.bind(this));

      return <ion-list ref={this.listRef}>{formattedLocations}</ion-list>;
    }

    return (
      <React.Fragment>
        <div className="info-message" id="previous-location-message">
          <p>
            {t('Here you can select or swipe to edit your previous locations')}
.
          </p>
        </div>
        <div id="user-locations">{getPastLocations.apply(this)}</div>
      </React.Fragment>
    );
  }
}

Component.propTypes = {
  locations: PropTypes.object.isRequired,
  onSelect: PropTypes.func,
};

export default Component;
