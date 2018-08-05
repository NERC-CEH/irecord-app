import React from 'react';
import { observer } from 'mobx-react';
import PropTypes from 'prop-types';

const Component = observer(props => {
  const { password: login, firstname, secondname } = props.user;
  return (
    <ul className="table-view buttons">
      {login && (
        <li className="table-view-cell">
          <a
            id="logout-button"
            className="navigate-right"
            onClick={props.logOut}
          >
            <span className="media-object pull-left icon icon-logout" />
            {t('Logout')}: {firstname} {secondname}
          </a>
        </li>
      )}
      {login && (
        <li className="table-view-cell">
          <a href="#user/statistics" className="navigate-right">
            <span className="media-object pull-left icon icon-statistics" />
            {t('Statistics')}
          </a>
        </li>
      )}

      {!login && (
        <li className="table-view-cell">
          <a href="#user/login" className="navigate-right">
            <span className="media-object pull-left icon icon-user" />
            {t('Login')}
          </a>
        </li>
      )}

      {!login && (
        <li className="table-view-cell">
          <a href="#user/register" className="navigate-right">
            <span className="media-object pull-left icon icon-user-plus" />
            {t('Register')}
          </a>
        </li>
      )}

      <li className="table-view-divider">{t('Settings')}</li>
      <li className="table-view-cell">
        <a href="#settings" className="navigate-right">
          <span className="media-object pull-left icon icon-settings" />
          {t('App')}
        </a>
      </li>

      <li className="table-view-divider">{t('Info')}</li>
      <li className="table-view-cell">
        <a href="#info/about" className="navigate-right">
          <span className="media-object pull-left icon icon-info" />
          {t('About')}
        </a>
      </li>
      <li className="table-view-cell">
        <a href="#info/help" className="navigate-right">
          <span className="media-object pull-left icon icon-help" />
          {t('Help')}
        </a>
      </li>
      <li className="table-view-cell">
        <a href="#info/privacy" className="navigate-right">
          <span className="media-object pull-left icon icon-lock-closed" />
          {t('Privacy Policy')}
        </a>
      </li>
      <li className="table-view-cell">
        <a href="#info/brc-approved" className="navigate-right">
          <span className="media-object pull-left icon icon-thumbs-up" />
          {t('BRC Approved')}
        </a>
      </li>
      <li className="table-view-cell">
        <a href="#info/credits" className="navigate-right">
          <span className="media-object pull-left icon icon-heart" />
          {t('Credits')}
        </a>
      </li>
    </ul>
  );
});

Component.propTypes = {
  logOut: PropTypes.func,
  user: PropTypes.object,
};

export default Component;
