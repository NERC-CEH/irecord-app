import React from 'react';
import PropTypes from 'prop-types';
import { IonIcon, IonButton, IonItem } from '@ionic/react';
import { removeCircleOutline, addCircleOutline } from 'ionicons/icons';
import './styles.scss';

class InputList extends React.Component {
  static propTypes = {
    config: PropTypes.object,
    default: PropTypes.array,
    onChange: PropTypes.func,
  };

  constructor(props) {
    super(props);

    let values = props.default || [];
    if (typeof props.default === 'string') {
      values = [props.default];
    }

    this.state = { values, newValue: '' };

    this.inputRef = React.createRef();
  }

  remove = index => {
    const values = [...this.state.values];
    values.splice(index - 1, 1); // -1 because of default
    this.setState({ values });

    if (!values.length) {
      this.props.onChange(null);
      return;
    }
    this.props.onChange(values);
  };

  add = () => {
    if (!this.state.newValue) {
      return;
    }

    const values = [this.state.newValue, ...this.state.values];
    this.setState({
      values,
      newValue: '',
    });

    this.props.onChange(values);
  };

  onChange = (index, { target }) => {
    if (index === 0) {
      this.setState({ newValue: target.value });
      return;
    }

    if (!target.value) {
      return;
    }
    const values = [...this.state.values];
    values[index - 1] = target.value; // -1 because of default

    this.setState({ values });
    this.props.onChange(values);
  };

  getInputComponent = (value, index) => {
    const { config = {} } = this.props;
    const { placeholder } = config;

    let button;
    if (index === 0) {
      button = (
        <IonButton fill="clear" slot="end" onClick={this.add}>
          <IonIcon slot="icon-only" icon={addCircleOutline} />
        </IonButton>
      );
    } else {
      button = (
        <IonButton
          key={index}
          fill="clear"
          slot="end"
          color="danger"
          onClick={() => this.remove(index)}
        >
          <IonIcon slot="icon-only" icon={removeCircleOutline} />
        </IonButton>
      );
    }

    return (
      <IonItem key={index}>
        <input
          type="text"
          className="plain-input"
          placeholder={t(placeholder)}
          value={value}
          onChange={e => this.onChange(index, e)}
        />
        {button}
      </IonItem>
    );
  };

  render() {
    const { config = {} } = this.props;
    const message = config.info;

    const inputs = [this.state.newValue, ...this.state.values].map(
      this.getInputComponent
    );

    return (
      <div>
        {message && (
          <div className="info-message">
            <p>{t(message)}</p>
          </div>
        )}
        {inputs}
      </div>
    );
  }
}

export default InputList;
