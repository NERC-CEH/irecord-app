import { Route } from 'react-router-dom';
import appModel from 'models/app';
import userModel from 'models/user';
import Login from './Login';
import Register from './Register';
import Reset from './Reset';

const LoginWrap = props => <Login {...props} userModel={userModel} />;
const RegisterWrap = props => (
  <Register {...props} userModel={userModel} appModel={appModel} />
);
const ResetWrap = props => <Reset {...props} userModel={userModel} />;

export default [
  <Route path="/user/login" key="/user/login" exact render={LoginWrap} />,
  <Route
    path="/user/register"
    key="/user/register"
    exact
    render={RegisterWrap}
  />,
  <Route path="/user/reset" key="/user/reset" exact render={ResetWrap} />,
];
