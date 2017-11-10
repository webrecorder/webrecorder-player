import React, { Component } from 'react';
import PropTypes from 'prop-types';
import WebSocketHandler from 'helpers/ws';
import path from 'path';

import { setBrowserHistory } from 'redux/modules/appSettings';
import { updateUrlAndTimestamp, updateTimestamp } from 'redux/modules/controls';

import './style.scss';


class Webview extends Component {
  static propTypes = {
    canGoBackward: PropTypes.bool,
    canGoForward: PropTypes.bool,
    dispatch: PropTypes.func,
    host: PropTypes.string,
    params: PropTypes.object,
    timestamp: PropTypes.string,
    url: PropTypes.string
  };

  static contextTypes = {
    currMode: PropTypes.string
  };

  constructor(props) {
    super(props);

    this.initialReq = true;
    this.socket = null;
    this.webviewHandle = null;
    this.internalUpdate = false;
  }

  componentDidMount() {
    const { currMode } = this.context;
    const { dispatch, host, params, timestamp, url } = this.props;

    this.socket = new WebSocketHandler(url, timestamp, params, currMode, dispatch, false, '@INIT', host);
    this.webviewHandle.addEventListener('ipc-message', this.handleReplayEvent);

    window.addEventListener('wr-go-back', this.goBack);
    window.addEventListener('wr-go-forward', this.goForward);
    window.addEventListener('wr-refresh', this.refresh);
  }

  componentWillReceiveProps(nextProps) {
    const { timestamp, url } = this.props;
    // console.log(nextProps.url, url, nextProps.url === url, nextProps.timestamp, timestamp, nextProps.timestamp === timestamp)

    if (nextProps.url !== url || nextProps.timestamp !== timestamp) {
      if (!this.internalUpdate) {
        const proxyUrl = `http://webrecorder.proxy/local/collection/${nextProps.timestamp}/${nextProps.url}`;
        console.log('updating url', proxyUrl);
        this.webviewHandle.loadURL(proxyUrl);
      }
      this.internalUpdate = false;
    }
  }

  shouldComponentUpdate() {
    // never rerender
    return false;
  }

  componentWillUnmount() {
    this.socket.close();
    this.webviewHandle.removeEventListener('ipc-message', this.handleReplayEvent);
    window.removeEventListener('wr-go-back', this.goBack);
    window.removeEventListener('wr-go-forward', this.goBack);
    window.removeEventListener('wr-refresh', this.refresh);
  }

  handleReplayEvent = (evt) => {
    const { canGoBackward, canGoForward, dispatch } = this.props;
    const state = evt.args[0];

    // set back & forward availability
    if (canGoBackward !== this.webviewHandle.canGoBack()) {
      dispatch(setBrowserHistory('canGoBackward', this.webviewHandle.canGoBack()));
    }
    if (canGoForward !== this.webviewHandle.canGoForward()) {
      dispatch(setBrowserHistory('canGoForward', this.webviewHandle.canGoForward()));
    }

    switch(state.wb_type) {
      case 'load':
        this.addNewPage(state);
        break;
      case 'hashchange': {
        let url = this.props.url.split('#', 1)[0];
        if (state.hash) {
          url = state.hash;
        }
        this.setUrl(url);
        break;
      }
      default:
        break;
    }
  }

  addNewPage = (state) => {
    const { currMode } = this.context;
    const { dispatch, timestamp, url } = this.props;

    if (!this.initialReq) {
      const rawUrl = decodeURI(state.url);

      if (state.ts !== timestamp && rawUrl !== url) {
        this.internalUpdate = true;
        dispatch(updateUrlAndTimestamp(rawUrl, state.ts));
      } else if (state.ts !== timestamp) {
        this.internalUpdate = true;
        dispatch(updateTimestamp(state.ts));
      }

      this.socket.setStatsUrls([rawUrl]);
    }
    this.initialReq = false;
  }

  goBack = () => {
    if (this.webviewHandle.canGoBack()) {
      this.webviewHandle.goToIndex(this.webviewHandle.getWebContents().getActiveIndex() - 1);
    }
  }

  goForward = () => {
    if (this.webviewHandle.canGoForward()) {
      this.webviewHandle.goToIndex(this.webviewHandle.getWebContents().getActiveIndex() + 1);
    }
  }

  refresh = () => {
    this.webviewHandle.reload();
  }

  render() {
    const { timestamp, url } = this.props;
    const proxyUrl = `http://webrecorder.proxy/local/collection/${timestamp}/${url}`;

    return (
      <webview
        id="replay"
        ref={(obj) => { this.webviewHandle = obj; }}
        src={proxyUrl}
        autosize="on"
        plugins="true"
        preload={`file://${path.join(__dirname, 'helpers/preload.js')}`}
        partition="persist:wr" />
    );
  }
}

export default Webview;
