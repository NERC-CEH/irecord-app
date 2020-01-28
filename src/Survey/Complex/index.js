import React from 'react';
import { Route } from 'react-router-dom';
import savedSamples from 'saved_samples';
import appModel from 'app_model';
import userModel from 'user_model';
import Default from './Default';
import Plant from './Plant';
import Moth from './Moth';

const App = () => {
  return (
    <>
      <Route
        path="/survey/complex/default"
        render={props => (
          <Default
            savedSamples={savedSamples}
            appModel={appModel}
            userModel={userModel}
            {...props}
          />
        )}
      />
      <Route
        path="/survey/complex/plant"
        render={props => (
          <Plant
            savedSamples={savedSamples}
            appModel={appModel}
            userModel={userModel}
            {...props}
          />
        )}
      />
      <Route
        path="/survey/complex/moth"
        render={props => (
          <Moth
            savedSamples={savedSamples}
            appModel={appModel}
            userModel={userModel}
            {...props}
          />
        )}
      />
    </>
  );
};
export default App;
