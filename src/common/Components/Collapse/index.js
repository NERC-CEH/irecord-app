import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { IonItem, IonIcon, IonLabel } from '@ionic/react';
import { remove, add } from 'ionicons/icons';
import './styles.scss';

class Collapse extends Component {
  state = { open: false };

  constructor(props) {
    super(props);
    this.onClick = this.onClick.bind(this);
  }

  onClick() {
    this.setState(prevState => ({ open: !prevState.open }));
  }

  render() {
    return (
      <>
        <IonItem
          onClick={this.onClick}
          class={`collapse-block in-list ${this.state.open ? 'opened' : ''}`}
          lines="none"
        >
          <IonLabel class="ion-text-wrap">{this.props.title}</IonLabel>
          <IonIcon icon={this.state.open ? remove : add} slot="end" />
        </IonItem>
        {this.state.open && <IonItem>{this.props.children}</IonItem>}
      </>
    );
  }
}

Collapse.propTypes = {
  children: PropTypes.any,
  title: PropTypes.string,
};

export default Collapse;
