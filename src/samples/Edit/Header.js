import React, { Component } from 'react';
import PropTypes from 'prop-types';
import App from 'app';
import Log from 'helpers/log';
import Device from 'helpers/device';
import radio from 'radio';
import _ from 'lodash';

function showInvalidsMessage(invalids) {
  // it wasn't saved so of course this error
  delete invalids.attributes.saved; // eslint-disable-line

  let missing = '';
  if (invalids.occurrences) {
    _.each(invalids.occurrences, (message, invalid) => {
      missing += `<b>${t(invalid)}</b> - ${t(message)}</br>`;
    });
  }
  if (invalids.attributes) {
    _.each(invalids.attributes, (message, invalid) => {
      missing += `<b>${t(invalid)}</b> - ${t(message)}</br>`;
    });
  }

  radio.trigger('app:dialog', {
    title: 'Sorry',
    body: missing,
    timeout: 2000,
  });
}

class Header extends Component {
  constructor(props) {
    super(props);
    this.send = this.send.bind(this);
  }

  send() {
    Log('Samples:Edit:Controller: send clicked.');
    const { sample, userModel } = this.props;

    const promise = sample.setToSend();

    // invalid sample
    if (!promise) {
      const invalids = sample.validationError;
      showInvalidsMessage(invalids);
      return;
    }

    promise
      .then(() => {
        // should we sync?
        if (!Device.isOnline()) {
          radio.trigger('app:dialog:error', {
            message: 'Looks like you are offline!',
          });
          return;
        }

        if (!userModel.hasLogIn()) {
          radio.trigger('user:login', { replace: true });
          return;
        }

        // sync
        sample.save(null, { remote: true }).catch((err = {}) => {
          Log(err, 'e');

          const visibleDialog = App.regions
            .getRegion('dialog')
            .$el.is(':visible');
          // we don't want to close any other dialog
          if (err.message && !visibleDialog) {
            radio.trigger(
              'app:dialog:error',
              `${t(
                'Sorry, we have encountered a problem while sending the record.'
              )}
                
                 <p><i>${err.message}</i></p>`
            );
          }
        });
        radio.trigger('sample:saved');
      })
      .catch(err => {
        Log(err, 'e');
        radio.trigger('app:dialog:error', err);
      });
  }

  render() {
    const { sample } = this.props;
    // show activity title.
    const activity = sample.get('activity');

    const activityTitle = activity ? activity.title : null;
    const training = sample.metadata.training;
    const isSynchronising = sample.remote.synchronising;

    const sendButton = !isSynchronising ? (
      <button id="sample-save-btn" onClick={this.send}>
        Send 
        {' '}
        <span className="icon icon-send" />
      </button>
    ) : null;

    return (
      <nav>
        <div className="pull-left">
          <a
            data-rel="back"
            className="icon icon-left-nav"
            onClick={() => window.history.back()}
          />
        </div>
        <div className="pull-right">{sendButton}</div>
        <h1 className="title">{t('Edit')}</h1>

        {(activityTitle || training) && (
          <div id="subheader">
            {activityTitle && <div className=" activity" />}

            {training && <div className=" training" />}
          </div>
        )}
      </nav>
    );
  }
}

Header.propTypes = {
  sample: PropTypes.object.isRequired,
  userModel: PropTypes.object.isRequired,
};

export default Header;
