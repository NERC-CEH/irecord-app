import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Autosuggest from 'react-autosuggest';
import { IonItem, IonLabel, IonInput } from '@ionic/react';
import './styles.scss';

// https://developer.mozilla.org/en/docs/Web/JavaScript/Guide/Regular_Expressions#Using_Special_Characters
function escapeRegexCharacters(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function getSuggestions(lookup, value) {
  const escapedValue = escapeRegexCharacters(value.trim());

  if (escapedValue === '') {
    return [];
  }

  const regex = new RegExp(`^${escapedValue}`, 'i');
  return lookup.filter(val => regex.test(val.name));
}

function getSuggestionValue(suggestion) {
  return suggestion.name;
}

function renderSuggestion(suggestion) {
  return (
    <IonItem>
      <IonLabel>{suggestion.name}</IonLabel>
    </IonItem>
  );
}

export default class AutoSuggestInput extends Component {
  static propTypes = {
    default: PropTypes.any,
    config: PropTypes.any.isRequired,
    lookup: PropTypes.array,
    info: PropTypes.string,
    placeholder: PropTypes.string,
    onChange: PropTypes.func.isRequired,
    validate: PropTypes.func,
  };

  constructor(props) {
    super(props);
    this.input = React.createRef();
    const initialValue = props.default || props.config.default || {};
    this.state = {
      value: initialValue.name || '',
      suggestions: [],
    };
  }

  onChange = (_, { newValue }) => {
    this.setState({ value: newValue });
  };

  onSuggestionSelected = (_, { suggestion, suggestionValue: value }) => {
    this.setState({
      value,
    });

    this.props.onChange(suggestion);
  };

  onSuggestionsFetchRequested = ({ value }) => {
    const config = this.props.config || {};
    const lookup = this.props.lookup || config.lookup;

    this.setState({
      suggestions: getSuggestions(lookup, value),
    });
  };

  onSuggestionsClearRequested = () => {
    this.setState({
      suggestions: [],
    });
  };

  render() {
    const { value, suggestions } = this.state;

    const config = this.props.config || {};
    const type = 'text';

    const message = this.props.info || config.info;
    const placeholder = this.props.placeholder || config.placeholder;

    const renderInputComponent = inputProps => (
      <IonInput
        ref={this.input}
        onIonChange={inputProps.onChange}
        type={type}
        inputmode={type}
        value={inputProps.value}
        debounce={200}
        placeholder={inputProps.placeholder}
        autofocus
        clearInput
        {...inputProps}
      />
    );

    const inputProps = {
      placeholder,
      value,
      onChange: this.onChange,
    };

    return (
      <div>
        {message && (
          <div className="info-message">
            <p>{t(message)}</p>
          </div>
        )}
        <Autosuggest
          suggestions={suggestions}
          onSuggestionsFetchRequested={this.onSuggestionsFetchRequested}
          onSuggestionsClearRequested={this.onSuggestionsClearRequested}
          getSuggestionValue={getSuggestionValue}
          renderSuggestion={renderSuggestion}
          renderInputComponent={renderInputComponent}
          onSuggestionSelected={this.onSuggestionSelected}
          inputProps={inputProps}
        />
      </div>
    );
  }
}
