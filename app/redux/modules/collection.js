import config from 'config';
import { fromJS } from 'immutable';
import { rts } from 'helpers/utils';

const COLL_LOAD = 'wr/coll/LOAD';
const COLL_LOAD_SUCCESS = 'wr/coll/LOAD_SUCCESS';
const COLL_LOAD_FAIL = 'wr/coll/LOAD_FAIL';

const COLL_SET_PUBLIC = 'wr/coll/SET_PUBLIC';
const COLL_SET_PUBLIC_SUCCESS = 'wr/coll/SET_PUBLIC_SUCCESS';
const COLL_SET_PUBLIC_FAIL = 'wr/coll/SET_PUBLIC_FAIL';

const initialState = fromJS({
  loading: false,
  loaded: false,
  error: null,
});


export default function collection(state = initialState, action = {}) {
  switch (action.type) {
    case COLL_LOAD:
      return state.set('loading', true);
    case COLL_LOAD_SUCCESS: {
      const {
        bookmarks,
        collection: { created_at, desc, download_url, id, recordings, size, title },
        user
      } = action.result;

      return state.merge({
        loading: false,
        loaded: true,
        accessed: action.accessed,
        error: null,

        bookmarks,
        created_at,
        desc,
        download_url,
        id,
        isPublic: action.result.collection['r:@public'],
        recordings,
        size,
        title,
        user,
      });
    }
    case COLL_LOAD_FAIL:
      return state.merge({
        loading: false,
        loaded: false,
        error: action.error
      });
    default:
      return state;
  }
}

export function isLoaded(globalState) {
  return globalState.get('collection') &&
         globalState.getIn(['collection', 'loaded']);
}

export function load(username, coll, host = '') {
  console.log('making request', `${rts(host)}${config.apiPath}/collections/${coll}?user=${username}`);
  return {
    types: [COLL_LOAD, COLL_LOAD_SUCCESS, COLL_LOAD_FAIL],
    accessed: Date.now(),
    promise: client => client.get(`${host}api/v1/collections/${coll}?user=${username}`)
  };
}
