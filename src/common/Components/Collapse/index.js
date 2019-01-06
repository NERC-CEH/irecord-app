import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './styles.scss';

class Collapse extends Component {
  constructor(props) {
    super(props);
    this.state = { open: false };
    this.onClick = this.onClick.bind(this);
  }

  onClick() {
    this.setState({ open: !this.state.open });
  }

  render() {
    return (
      <ion-item
        onClick={this.onClick}
        class={`collapse-block in-list hydrated item ${
          this.state.open ? 'opened' : ''
        }`}>
        <div className="header">{this.props.title}</div>
        {this.state.open && <div className="body">{this.props.children}</div>}
      </ion-item>
    );
  }
}

Collapse.propTypes = {
  children: PropTypes.any,
  title: PropTypes.string,
};

export default Collapse;
