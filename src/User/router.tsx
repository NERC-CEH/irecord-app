import { Route } from 'react-router-dom';
import Login from './Login';
import Register from './Register';
import Reset from './Reset';

export default [
  <Route path="/user/login" key="/user/login" exact component={Login} />,
  <Route
    path="/user/register"
    key="/user/register"
    exact
    component={Register}
  />,
  <Route path="/user/reset" key="/user/reset" exact component={Reset} />,
];
