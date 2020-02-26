import React from 'react';
import PropTypes from 'prop-types';
import * as Sentry from '@sentry/browser';
import ErrorMessage from './components/ErrorMessage';

export default class ErrorBoundary extends React.Component {
  static propTypes = {
    children: PropTypes.oneOfType([
      PropTypes.arrayOf(PropTypes.node),
      PropTypes.node,
    ]),
  };

  constructor(props) {
    super(props);
    this.state = { hasError: false, eventId: null };
  }

  static getDerivedStateFromError() {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    Sentry.withScope(scope => {
      scope.setExtras(errorInfo);

      const eventId = Sentry.captureException(error);
      this.setState({ eventId });
    });
  }

  render() {
    if (this.state.hasError) {
      const { eventId } = this.state;
      console.error(eventId);
      return <ErrorMessage eventId={eventId} />;
    }

    return this.props.children;
  }
}
