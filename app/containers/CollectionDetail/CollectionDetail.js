import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { asyncConnect } from 'redux-connect';

import { truncate } from 'helpers/utils';
import { load as loadColl } from 'redux/modules/collection';
import { getOrderedBookmarks, getOrderedRecordings } from 'redux/selectors';

import CollectionDetailUI from 'components/CollectionDetailUI';


class CollectionDetail extends Component {

    // TODO move to HOC
  static childContextTypes = {
    canAdmin: PropTypes.bool,
    canWrite: PropTypes.bool
  };

  getChildContext() {
    return {
      canAdmin: false,
      canWrite: false
    };
  }

  render() {
    const { collection, params: { user, coll } } = this.props;

    return [
      <CollectionDetailUI key="c" {...this.props} />
    ];
  }
}


const initialData = [
  {
    promise: ({ params, store: { getState, dispatch } }) => {
      const { user, coll } = params;
      const host = getState().getIn(['appSettings', 'host']);
      console.log('load users', host, user, coll);
      return dispatch(loadColl(user, coll, host));
    }
  }
];

const mapStateToProps = (state) => {
  return {
    auth: state.get('auth'),
    collection: state.get('collection'),
    recordings: getOrderedRecordings(state),
    bookmarks: getOrderedBookmarks(state)
  };
};

export default asyncConnect(
  initialData,
  mapStateToProps
)(CollectionDetail);
