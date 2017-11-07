import { fromJS } from 'immutable';

const SET_HOST = 'wr/appSettings/SET_HOST';

// see if host is stored in sessionStorage or null
const initialState = fromJS({
  host: window.sessionStorage.getItem('_wr_host')
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
  window.sessionStorage.setItem('_wr_host', host);
  return {
    type: SET_HOST,
    host
  };
}
