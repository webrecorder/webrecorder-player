import Immutable from 'immutable';
import { combineReducers } from 'redux-immutable';
import { setToImmutableStateFunc, setToMutableStateFunc,
         immutableReducer as immutableReduxAsyncConnect } from 'redux-connect';

import routerReducer from './routerReducer';

import appSettings from './appSettings';
import auth from './auth';
import collection from './collection';
import controls from './controls';
import infoStats from './infoStats';
import sizeCounter from './sizeCounter';
import user from './user';


// Set the mutability/immutability functions for reduxAsyncConnect
setToImmutableStateFunc(mutableState => Immutable.fromJS(mutableState));
setToMutableStateFunc(immutableState => immutableState.toJS());

export default combineReducers({
  routing: routerReducer,
  reduxAsyncConnect: immutableReduxAsyncConnect,
  auth,
  appSettings,
  collection,
  controls,
  sizeCounter,
  infoStats,
  user
});
