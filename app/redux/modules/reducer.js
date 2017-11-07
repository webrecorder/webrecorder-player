import { combineReducers } from 'redux';
import { combineReducers as combineImmutableReduers } from 'redux-immutable';
import { reducer as reduxAsyncConnect } from 'redux-connect';
import { routerReducer } from 'react-router-redux';

import { reducer as searchReducer } from 'redux-search';

import appSettings from './appSettings';
import auth from './auth';
import collection from './collection';
import controls from './controls';
import infoStats from './infoStats';
import sizeCounter from './sizeCounter';
import user from './user';

const makeAppReducer = () => combineImmutableReduers({
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
  routing: routerReducer,
  app: makeAppReducer()
});
