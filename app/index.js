import React from 'react';
import { render } from 'react-dom';
import { AppContainer } from 'react-hot-loader';
import { createHashHistory, createMemoryHistory, createHistory, useBasename } from 'history';
import { Provider } from 'react-redux';
import { syncHistoryWithStore } from 'react-router-redux';


import ApiClient from './helpers/ApiClient';
import baseRoute from './playerRoutes';
import createStore from './redux/create';
import Root from './root';

import './app.global.scss';

const client = new ApiClient();
const dest = document.getElementById('app');
window.wrAppContainer = dest;

const browserHistory = createHashHistory();
const store = createStore(browserHistory, client);
const history = syncHistoryWithStore(browserHistory, store);

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
