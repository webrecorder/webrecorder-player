import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { asyncConnect } from 'redux-connect';
import { createSearchAction } from 'redux-search';

import { truncate } from 'helpers/utils';
import { isLoaded, load as loadColl } from 'redux/modules/collection';
import { getOrderedBookmarks, getOrderedRecordings,
         bookmarkSearchResults } from 'redux/selectors';

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
      const state = getState();
      const { app } = state;
      const host = app.getIn(['appSettings', 'host']);

      if(!isLoaded(state)) {
        return dispatch(loadColl(user, coll, host));
      }

      return undefined;
    }
  }
];

const mapStateToProps = (outerState) => {
  const { app } = outerState;
  const { bookmarkFeed, searchText } = bookmarkSearchResults(outerState);
  const isIndexing = !bookmarkFeed.size && app.getIn(['collection', 'bookmarks']).size && !searchText;

  return {
    auth: app.get('auth'),
    collection: app.get('collection'),
    recordings: getOrderedRecordings(app),
    bookmarks: isIndexing ? getOrderedBookmarks(app) : bookmarkFeed,
    searchText
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    searchBookmarks: createSearchAction('bookmarks'),
    dispatch
  };
};

export default asyncConnect(
  initialData,
  mapStateToProps,
  mapDispatchToProps
)(CollectionDetail);
