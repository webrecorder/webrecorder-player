import { fromJS } from 'immutable';

const SET_HOST = 'wr/appSettings/SET_HOST';

const initialState = fromJS({
  host: null
});

export default function appSettings(state = initialState, action = {}) {
  switch(action.type) {
    case SET_HOST:
      return state.set('host', action.host);
    default:
      return state;
  }
}


export function setHost({ host }) {
  return {
    type: SET_HOST,
    host
  };
}
