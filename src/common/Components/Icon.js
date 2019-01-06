import React from 'react';
import PropTypes from 'prop-types';

const Icon = props => <span className={`icon icon-${props.i}`} />;

Icon.propTypes = { i: PropTypes.string.isRequired };

export default Icon;
