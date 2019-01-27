import React from 'react';
import PropTypes from 'prop-types';

const Component = props => (
  <ul className="table-view">
    <li>
      <p>
        iRecord App is an application that enables you to get involved in
        biological recording. You can contribute your sightings with photos, GPS
        acquired coordinates, descriptions and other information, thus providing
        scientists with important new biodiversity information that contributes
        to nature conservation, planning, research and education.
      </p>
    </li>
    <li>
      <p>
        <strong>Who can use the app?</strong>
      </p>
      <p>
        We encourage everyone to get involved with recording species as it is
        very easy and quick to submit useful records without specialist
        knowledge. It doesn&apos;t matter whether you are an amateur enthusiast
        or a qualified biologist, iRecord App is for anyone who wants to
        contribute to our database observations of the natural environment.
      </p>
    </li>
    <li>
      <p>
        <strong>App Development</strong>
      </p>
      <p>
        This app was hand crafted with love by
        <a href="https://kazlauskis.com" style={{whiteSpace: 'nowrap'}}> Karolis Kazlauskis</a> and CEH developers.
        For suggestions and feedback please do not hesitate to{' '}
        <a href="mailto:apps%40ceh.ac.uk?subject=iRecord%20App%20Support%20%26%20Feedback&body=%0A%0A%0AVersion%3A%20<%- obj.version %>%0ABrowser%3A <%- window.navigator.appVersion %>%0A">
          contact us
        </a>.
      </p>
    </li>
    <li>
      <p className="app-version">
        v
        {props.version} ({props.build})
      </p>
    </li>
  </ul>
);

Component.propTypes = {
  version: PropTypes.string,
  build: PropTypes.string
};

export default Component;
