import { Route } from 'react-router-dom';
import appModel from 'models/app';
import userModel from 'models/user';
import Locations from './Locations';
import Menu from './Menu';
import Survey from './Survey';

export default [
  <Route
    path="/settings/menu"
    key="/settings/menu"
    exact
    render={() => <Menu userModel={userModel} appModel={appModel} />}
  />,
  <Route
    path="/settings/locations"
    key="/settings/locations"
    exact
    render={() => <Locations userModel={userModel} appModel={appModel} />}
  />,
  <Route
    path="/settings/survey"
    key="/settings/survey"
    exact
    render={() => <Survey userModel={userModel} appModel={appModel} />}
  />,
];
