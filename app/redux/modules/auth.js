import { fromJS } from 'immutable';

const defaultUser = fromJS({
  username: 'local',
  role: 'archivist',
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
