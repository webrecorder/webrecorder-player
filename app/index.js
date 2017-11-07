import React from 'react';
import { render } from 'react-dom';
import { is } from 'immutable';
import { AppContainer } from 'react-hot-loader';
import { createHashHistory, createHistory, useBasename } from 'history';
import { Provider } from 'react-redux';
import { syncHistoryWithStore } from 'react-router-redux';

import ApiClient from './helpers/ApiClient';
import baseRoute from './playerRoutes';
import createStore from './redux/create';
import Root from './root';

import './app.global.scss';

const client = new ApiClient();
const dest = document.getElementById('root');
window.wrAppContainer = dest;

let hstory;
if (process.env.NODE_ENV === 'production') {
  hstory = useBasename(createHistory)({
    basename: window.location.pathname
  });
} else {
  hstory = createHashHistory();
}
const store = createStore(hstory, client);

const createSelectLocationState = () => {
  let prevRoutingState;
  let prevRoutingStateJS;

  return (state) => {
    const routingState = state.app.get('routing');

    if (!is(prevRoutingState, routingState)) {
      prevRoutingState = routingState;
      prevRoutingStateJS = routingState.toJS();
    }

    return prevRoutingStateJS;
  };
};

const history = syncHistoryWithStore(hstory, store, {
  selectLocationState: createSelectLocationState()
});

const renderApp = (renderProps) => {
  render(
    <AppContainer>
      <Provider store={store} key="provider">
        <Root {...{ store, history, ...renderProps }} />
      </Provider>
    </AppContainer>,
    dest
  );
};

// render app
renderApp({ routes: baseRoute(store), client });

if (module.hot) {
  module.hot.accept('./playerRoutes', () => {
    const nextRoutes = require('./playerRoutes');
    renderApp({ routes: nextRoutes(store), client });
  });
}
