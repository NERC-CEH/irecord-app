import React from 'react';
import PropTypes from 'prop-types';

function ErrorMessage({ eventId }) {
  return (
    <div
      style={{
        textAlign: 'center',
        opacity: 0.7,
        background: 'pink',
        margin: '0 10%',
        padding: '30px',
        position: 'absolute',
        top: '30%',
      }}
    >
      <span
        style={{
          fontWeight: 500,
        }}
      >
        Oops! Something, went wrong.
      </span>
      <p
        style={{
          fontSize: 10,
        }}
      >
        This is the error event id: 
        {' '}
        {eventId}
      </p>
    </div>
  );
}

ErrorMessage.propTypes = {
  eventId: PropTypes.any.isRequired,
};

export default ErrorMessage;
