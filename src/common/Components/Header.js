import React from 'react';
import PropTypes from 'prop-types';

const defaultOnLeave = () => window.history.back();

const Header = props => (
  <div>
    <div id="left-panel" className="pull-left">
      <a
        data-rel="back"
        className="icon icon-left-nav"
        onClick={props.onLeave || defaultOnLeave}
      />
    </div>

    <div id="right-panel" className="pull-right">
      {props.rightPanel}
    </div>
    <h1 className="title">{props.children}</h1>
  </div>
);

Header.propTypes = {
  children: PropTypes.any.isRequired,
  rightPanel: PropTypes.any,
  onLeave: PropTypes.func,
};

export default Header;
