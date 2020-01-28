import React from 'react';
import { Route } from 'react-router-dom';
import appModel from 'app_model';
import userModel from 'user_model';
import Login from './Login';
import Register from './Register';
import Reset from './Reset';

export default [
  <Route
    path="/user/login"
    key="/user/login"
    exact
    render={() => <Login userModel={userModel} />}
  />,
  <Route
    path="/user/register"
    key="/user/register"
    exact
    render={() => <Register userModel={userModel} appModel={appModel} />}
  />,
  <Route
    path="/user/reset"
    key="/user/reset"
    exact
    render={() => <Reset userModel={userModel} />}
  />,
];
