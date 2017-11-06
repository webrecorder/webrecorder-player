import Immutable from 'immutable';
import { combineReducers } from 'redux';
import { combineReducers as combineImmutableReduers } from 'redux-immutable';
import { reducer as reduxAsyncConnect } from 'redux-connect';

import { reducer as searchReducer } from 'redux-search';


import routerReducer from './routerReducer';

import appSettings from './appSettings';
import auth from './auth';
import collection from './collection';
import controls from './controls';
import infoStats from './infoStats';
import sizeCounter from './sizeCounter';
import user from './user';

const makeAppReducer = () => combineImmutableReduers({
  routing: routerReducer,
  auth,
  appSettings,
  collection,
  controls,
  sizeCounter,
  infoStats,
  user
});

export default combineReducers({
  search: searchReducer,
  reduxAsyncConnect,
  app: makeAppReducer()
});
