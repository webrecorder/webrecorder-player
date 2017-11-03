import { createStore as _createStore, applyMiddleware, compose } from 'redux';
import { routerMiddleware } from 'react-router-redux';

import createMiddleware from './middleware/clientMiddleware';


export default function createStore(history, client) {
  // Sync dispatched route actions to the history
  const reduxRouterMiddleware = routerMiddleware(history);

  const middleware = [createMiddleware(client), reduxRouterMiddleware];

  let finalCreateStore;
  if (__DEVELOPMENT__ && __DEVTOOLS__) {

    const composeEnhancer = typeof window === 'object' && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ ?
                              window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ :
                              compose;

    finalCreateStore = composeEnhancer(
      applyMiddleware(...middleware)
    )(_createStore);
  } else {
    finalCreateStore = applyMiddleware(...middleware)(_createStore);
  }
  // eslint-disable-next-line global-require
  const reducer = require('./modules/reducer');

  const store = finalCreateStore(reducer);

  if (__DEVELOPMENT__ && module.hot) {
    module.hot.accept('./modules/reducer', () => {
      // eslint-disable-next-line global-require
      store.replaceReducer(require('./modules/reducer'));
    });
  }

  return store;
}
