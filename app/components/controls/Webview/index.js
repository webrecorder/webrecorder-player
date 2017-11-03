import React, { Component } from 'react';
import PropTypes from 'prop-types';

import config from 'config';

class Webview extends Component {
  static propTypes = {
    params: PropTypes.object,
    timestamp: PropTypes.string,
    url: PropTypes.string
  };

  render() {
    const { params: { user, coll}, timestamp, url } = this.props;
    const proxyUrl = `${config.proxyHost}/${user}/${coll}/${timestamp}_mp/${url}`;

    return (
      <webview id="replay" src={proxyUrl} autosize="on" plugins partition="persist:wr" />
    );
  }
}

export default Webview;
