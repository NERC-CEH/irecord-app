import { Route } from 'react-router-dom';
import About from './About';
import BRCApproved from './BRCApproved';
import Credits from './Credits';
import Help from './Help';

export default [
  <Route path="/info/credits" key="/info/credits" exact component={Credits} />,
  <Route path="/info/about" key="/info/about" exact component={About} />,
  <Route path="/info/help" key="/info/about" exact component={Help} />,
  <Route
    path="/info/brc-approved"
    key="/info/about"
    exact
    component={BRCApproved}
  />,
];
