import React from 'react';
import PropTypes from 'prop-types';
import ErrorBoundary from 'Components/ErrorBoundary';
import { IonContent } from '@ionic/react';

const Main = React.forwardRef(({ children, ...props }, ref) => {
  return (
    <ErrorBoundary>
      <IonContent {...props} ref={ref}>
        {children}
      </IonContent>
    </ErrorBoundary>
  );
});

Main.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]),
};
export default Main;
