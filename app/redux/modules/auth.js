import { fromJS } from 'immutable';

const defaultUser = __PLAYER__ ?
  fromJS({
    username: 'local',
    role: 'archivist',
    anon: true
  }) :
  fromJS({
    username: null,
    role: null,
    anon: true
  });

const initialState = fromJS({
  loaded: true,
  user: defaultUser
});

export default function auth(state = initialState, action = {}) {
  switch (action.type) {
    default:
      return state;
  }
}
