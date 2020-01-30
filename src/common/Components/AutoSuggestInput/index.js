import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { observer } from 'mobx-react';
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

@observer
class AutoSuggestInput extends Component {
  static propTypes = {
    default: PropTypes.any,
    config: PropTypes.any.isRequired,
    lookup: PropTypes.array,
    info: PropTypes.string,
    placeholder: PropTypes.string,
    onChange: PropTypes.func,
    onSuggestionSelected: PropTypes.func,
    validate: PropTypes.func,
    renderSuggestionsContainer: PropTypes.func,
    children: PropTypes.any,
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
    this.props.onChange && this.props.onChange({ name: newValue });
  };

  onSuggestionSelected = (_, { suggestion, suggestionValue: value }) => {
    this.setState({
      value,
    });

    this.props.onSuggestionSelected &&
      this.props.onSuggestionSelected(suggestion);
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

  componentDidUpdate(prevProps) {
    const prevPropsInitialValue =
      prevProps.default || prevProps.config.default || {};
    const initialValue = this.props.default || this.props.config.default || {};

    if (prevPropsInitialValue.name !== initialValue.name) {
      this.setState({ value: initialValue.name || '' }); // eslint-disable-line react/no-did-update-set-state
    }
  }

  render() {
    const { value, suggestions } = this.state;

    const config = this.props.config || {};
    const type = 'text';

    const message = this.props.info || config.info;
    const placeholder = this.props.placeholder || config.placeholder;

    const renderInputComponent = inputProps => {
      return (
        <IonInput
          ref={this.input}
          onIonChange={inputProps.onChange}
          type={type}
          inputmode={type}
          value={inputProps.value}
          debounce={300}
          placeholder={inputProps.placeholder}
          autofocus
          autocapitalize
          clearInput
          {...inputProps}
        >
          {this.props.children}
        </IonInput>
      );
    };

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
          renderSuggestionsContainer={
            this.props.renderSuggestionsContainer || undefined
          }
          renderSuggestion={renderSuggestion}
          renderInputComponent={renderInputComponent}
          onSuggestionSelected={this.onSuggestionSelected}
          inputProps={inputProps}
        />
      </div>
    );
  }
}

export default AutoSuggestInput;
