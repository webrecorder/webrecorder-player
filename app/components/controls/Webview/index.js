import React, { Component } from 'react';
import PropTypes from 'prop-types';
import WebSocketHandler from 'helpers/ws';
import path from 'path';
import classNames from 'classnames';
import { ipcRenderer } from 'electron';

import { openDroppedFile } from 'helpers/utils';

import { setBrowserHistory } from 'redux/modules/appSettings';
import { updateUrlAndTimestamp, updateTimestamp } from 'redux/modules/controls';

import './style.scss';

const { app } = require('electron').remote;


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
    currMode: PropTypes.string,
    router: PropTypes.object
  };

  constructor(props) {
    super(props);

    this.initialReq = true;
    this.socket = null;
    this.webviewHandle = null;
    this.internalUpdate = false;
    this.state = { loading: true };
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
        this.loadingTimeout();
        this.setState({ loading: true });

        this.webviewHandle.loadURL(proxyUrl);
      }
      this.internalUpdate = false;
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (nextState.loading !== this.state.loading) {
      return true;
    }

    return false;
  }

  componentWillUnmount() {
    this.socket.close();
    this.webviewHandle.removeEventListener('ipc-message', this.handleReplayEvent);
    window.removeEventListener('wr-go-back', this.goBack);
    window.removeEventListener('wr-go-forward', this.goForward);
    window.removeEventListener('wr-refresh', this.refresh);
  }

  loadingTimeout = () => {
        // set a timeout in case loading never finishes
    clearTimeout(this.timeoutHandle);
    this.timeoutHandle = setTimeout(() => { this.setState({loading: false})}, 15000);
  }

  openDroppedFile = (filename) => {
    if (filename && filename.match(/\.w?arc(\.gz)?|\.har$/)) {
      this.context.router.push('/');
      ipcRenderer.send('open-warc', filename);
    } else if (filename) {
      window.alert('Sorry, only WARC or ARC files (.warc, .warc.gz, .arc, .arc.gz) or HAR (.har) can be opened');
    }
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
      case 'open':
        this.openDroppedFile(state.filename);
        break;
      case 'load':
        this.setState({ loading: false });
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
      this.loadingTimeout();
      this.setState({ loading: true});
      this.webviewHandle.goToIndex(this.webviewHandle.getWebContents().getActiveIndex() - 1);
    }
  }

  goForward = () => {
    if (this.webviewHandle.canGoForward()) {
      this.loadingTimeout();
      this.setState({ loading: true});
      this.webviewHandle.goToIndex(this.webviewHandle.getWebContents().getActiveIndex() + 1);
    }
  }

  refresh = () => {
    this.webviewHandle.reload();
  }

  render() {
    const { loading } = this.state;
    const { timestamp, url } = this.props;
    const proxyUrl = `http://webrecorder.proxy/local/collection/${timestamp}/${url}`;
    const classes = classNames('webview-wrapper', { loading });

    const appPath = app.getAppPath();
    let preloadPath;
    if (process.env.NODE_ENV === 'production') {
      preloadPath = path.resolve(appPath, '..', 'preload.js');
    } else {
      preloadPath = path.resolve(__dirname, '..', 'preload.js');
    }

    return (
      <div className={classes}>
        <webview
          id="replay"
          ref={(obj) => { this.webviewHandle = obj; }}
          src={proxyUrl}
          autosize="on"
          plugins="true"
          preload={preloadPath}
          partition="persist:wr" />
      </div>
    );
  }
}

export default Webview;
