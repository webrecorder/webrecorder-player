import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { asyncConnect } from 'redux-connect';

import { isLoaded, load as loadColl } from 'redux/modules/collection';
import { getArchives, updateUrlAndTimestamp } from 'redux/modules/controls';
import { resetStats } from 'redux/modules/infoStats';
import { getBookmarkTitle } from 'redux/selectors';

import { Sidebar } from 'containers';
import { Webview } from 'components/controls';


class Replay extends Component {
  static propTypes = {
    auth: PropTypes.object,
    collection: PropTypes.object,
    canGoBackward: PropTypes.bool,
    canGoForward: PropTypes.bool,
    dispatch: PropTypes.func,
    host: PropTypes.string,
    params: PropTypes.object,
    recordingIndex: PropTypes.number,
    timestamp: PropTypes.string,
    url: PropTypes.string,
    webviewLoading: PropTypes.bool
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
    const { canGoBackward, canGoForward, dispatch,
            host, params, timestamp, url, webviewLoading } = this.props;

    const classes = classNames('webview-wrapper', { loading: webviewLoading });

    return (
      <div className="webview-container">
        <Sidebar />
        <div className={classes}>
          <Webview
            key="webview"
            host={host}
            params={params}
            dispatch={dispatch}
            timestamp={timestamp}
            canGoBackward={canGoBackward}
            canGoForward={canGoForward}
            url={url} />
        </div>
      </div>
    );
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
    host: app.getIn(['appSettings', 'host']),
    timestamp: app.getIn(['controls', 'timestamp']),
    url: app.getIn(['controls', 'url']),
    canGoBackward: app.getIn(['appSettings', 'canGoBackward']),
    canGoForward: app.getIn(['appSettings', 'canGoForward']),
    webviewLoading: app.getIn(['controls','webviewLoading'])
  };
};

export default asyncConnect(
  initialData,
  mapStateToProps
)(Replay);
