import React from 'react';
import { render } from 'react-dom';
import { AppContainer } from 'react-hot-loader';
import { createHashHistory, createHistory, useBasename } from 'history';
import { Provider } from 'react-redux';

import ApiClient from './helpers/ApiClient';
import baseRoute from './playerRoutes';
import createStore from './redux/create';
import Root from './root';

import './app.global.scss';

const client = new ApiClient();
const dest = document.getElementById('root');
window.wrAppContainer = dest;

let history;
if (process.env.NODE_ENV === 'production') {
  history = useBasename(createHistory)({
    basename: window.location.pathname
  });
} else {
  history = createHashHistory();
}
const store = createStore(history, client);

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
