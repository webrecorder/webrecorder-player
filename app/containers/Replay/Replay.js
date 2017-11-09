import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { asyncConnect } from 'redux-connect';

import { remoteBrowserMod, truncate } from 'helpers/utils';
import config from 'config';

import { getOrderedBookmarks, getActiveRecording, getRecording } from 'redux/selectors';
import { isLoaded, load as loadColl } from 'redux/modules/collection';
import { configureProxy, getArchives, updateUrlAndTimestamp } from 'redux/modules/controls';
import { resetStats } from 'redux/modules/infoStats';

import { ReplayUI, Webview } from 'components/controls';


class Replay extends Component {
  static propTypes = {
    auth: PropTypes.object,
    collection: PropTypes.object,
    dispatch: PropTypes.func,
    bookmarks: PropTypes.object,
    recordingIndex: PropTypes.number,
    params: PropTypes.object,
    timestamp: PropTypes.string,
    url: PropTypes.string
  };

  // TODO move to HOC
  static childContextTypes = {
    currMode: PropTypes.string,
    canAdmin: PropTypes.bool
  };

  constructor(props) {
    super(props);


    // TODO: unify replay and replay-coll
    this.mode = 'replay-coll';
  }

  getChildContext() {
    const { auth, params } = this.props;

    return {
      currMode: this.mode,
      canAdmin: false
    };
  }

  componentWillUnmount() {
    // clear info stats
    this.props.dispatch(resetStats());
  }

  render() {
    const { bookmarks, canGoBackward, canGoForward, collection, dispatch,
            host, params, recording, recordingIndex, timestamp, url } = this.props;

    return [
      <ReplayUI
        key="replay-ui"
        bookmarks={bookmarks}
        dispatch={dispatch}
        recordingIndex={recordingIndex}
        params={params}
        timestamp={timestamp}
        url={url} />,
      <Webview
        key="webview"
        host={host}
        params={params}
        dispatch={dispatch}
        timestamp={timestamp}
        canGoBackward={canGoBackward}
        canGoForward={canGoForward}
        url={url} />
    ];
  }
}

const initialData = [
  {
    // set url and ts in store
    promise: ({ location: { hash, search }, params: { ts, splat }, store: { dispatch } }) => {
      const compositeUrl = `${splat}${search}${hash}`;

      return dispatch(updateUrlAndTimestamp(compositeUrl, ts));
    }
  },
  {
    promise: ({ params, store: { dispatch, getState } }) => {
      const state = getState();
      const collection = state.app.get('collection');
      const host = state.app.getIn(['appSettings', 'host']);
      const { user, coll } = params;

      if(!isLoaded(state)) {
        return dispatch(loadColl(user, coll, host));
      }

      return undefined;
    }
  },
  {
    promise: ({ store: { dispatch, getState } }) => {
      const { app } = getState();
      const host = app.getIn(['appSettings', 'host']);

      // TODO: determine if we need to test for stale archives
      if (!app.getIn(['controls', 'archives']).size) {
        return dispatch(getArchives(host));
      }

      return undefined;
    }
  }
];

const mapStateToProps = ({ app }) => {
  return {
    bookmarks: getOrderedBookmarks(app),
    collection: app.get('collection'),
    host: app.getIn(['appSettings', 'host']),
    recording: getRecording(app),
    recordingIndex: getActiveRecording(app),
    timestamp: app.getIn(['controls', 'timestamp']),
    url: app.getIn(['controls', 'url']),
    canGoBackward: app.getIn(['appSettings', 'canGoBackward']),
    canGoForward: app.getIn(['appSettings', 'canGoForward'])
  };
};

export default asyncConnect(
  initialData,
  mapStateToProps
)(Replay);
