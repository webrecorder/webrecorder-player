import React, { Component } from 'react';
import PropTypes from 'prop-types';
import WebSocketHandler from 'helpers/ws';
import { ipcRenderer } from 'electron';
import path from 'path';

import { updateTimestamp, updateUrl } from 'redux/modules/controls';

import './style.scss';


class Webview extends Component {
  static propTypes = {
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
  }

  componentDidMount() {
    const { currMode } = this.context;
    const { dispatch, host, params, timestamp, url } = this.props;

    this.socket = new WebSocketHandler(url, timestamp, params, currMode, dispatch, false, '@INIT', host);
    this.webviewHandle.addEventListener('ipc-message', this.handleReplayEvent);
  }

  setUrl = (url, noStatsUpdate = false) => {
    const { currMode } = this.context;
    const rawUrl = decodeURI(url);

    console.log('setUrl called', this.props.url, rawUrl);

    if (this.props.url !== rawUrl) {
      this.props.dispatch(updateUrl(rawUrl));
    }

    if (!noStatsUpdate) {
      this.socket.setStatsUrls([rawUrl]);
    }
  }

  handleReplayEvent = (evt, arg) => {
    // ignore postMessages from other sources
    if (!__PLAYER__ && (evt.origin.indexOf(config.contentHost) === -1 || typeof evt.data !== 'object')) {
      return;
    }

    const state = __PLAYER__ ? evt.args[0] : evt.data;
    const specialModes = ['cookie', 'skipreq', 'bug-report'].indexOf(state.wb_type) !== -1;

    if (!__PLAYER__ && (!this.iframe || (evt.source !== this.iframe.contentWindow && !specialModes))) {
      return;
    }

    switch(state.wb_type) {
      case 'load':
        this.addNewPage(state);
        break;
      case 'cookie':
        this.setDomainCookie(state);
        break;
      case 'snapshot':
        break;
      case 'skipreq':
        this.addSkipReq(state);
        break;
      case 'hashchange': {
        let url = this.props.url.split("#", 1)[0];
        if (state.hash) {
          url = state.hash;
        }
        this.setUrl(url);
        break;
      }
      case 'bug-report':
        this.props.dispatch(showModal());
        break;
      default:
        break;
    }
  }

  addNewPage = (state) => {
    const { currMode } = this.context;
    const { timestamp } = this.props;

    if (state && state.ts && currMode !== 'record' && currMode.indexOf('extract') === -1 && state.ts !== timestamp) {
      this.props.dispatch(updateTimestamp(state.ts));
    }

    if (state.is_error) {
      this.setUrl(state.url);
    } else if (['replay', 'replay-coll'].includes(currMode)) {
      if (!this.initialReq) {
        if (state.ts !== timestamp) {
          this.props.dispatch(updateTimestamp(state.ts));
        }

        this.setUrl(state.url);
        if (!__PLAYER__) {
          setTitle('Archives', state.url, state.title);
        }
      }
      this.initialReq = false;
    }
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
        plugins
        preload={`file://${path.join(__dirname, 'helpers/preload.js')}`}
        partition="persist:wr" />
    );
  }
}

export default Webview;
