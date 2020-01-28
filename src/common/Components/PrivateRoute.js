import React from 'react';
import { Route, Redirect } from 'react-router-dom';
import PropTypes from 'prop-types';
import userModel from 'user_model';

const PrivateRoute = ({ component }) => {
  const routeRender = props => {
    if (userModel.hasLogIn()) {
      return React.createElement(component, props);
    }
    return (
      <Redirect
        push
        to={{
          pathname: '/user/login',
          state: { from: props.location }, // eslint-disable-line
        }}
      />
    );
  };

  // eslint-disable-next-line
  return <Route render={routeRender.bind(this)} />;
};

PrivateRoute.propTypes = {
  component: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
};
export default PrivateRoute;
