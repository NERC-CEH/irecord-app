import React from 'react';
import { Route } from 'react-router-dom';
import savedSamples from 'saved_samples';
import appModel from 'app_model';
import userModel from 'user_model';
import Default from './Default';
import Complex from './Complex';

const App = () => {
  return (
    <>
      <Route
        path="/survey/default"
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
        path="/survey/complex"
        render={props => (
          <Complex
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
