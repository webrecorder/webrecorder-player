import React, { Component } from 'react';
import PropTypes from 'prop-types';

import './style.scss';

class Webview extends Component {
  static propTypes = {
    params: PropTypes.object,
    timestamp: PropTypes.string,
    url: PropTypes.string
  };

  render() {
    const { timestamp, url } = this.props;
    const proxyUrl = `http://webrecorder.proxy/local/collection/${timestamp}/${url}`;

    return (
      <webview id="replay" src={proxyUrl} autosize="on" plugins partition="persist:wr" />
    );
  }
}

export default Webview;
