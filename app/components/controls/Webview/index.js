import React, { Component } from 'react';
import PropTypes from 'prop-types';

import config from 'config';
import './style.scss';

class Webview extends Component {
  static propTypes = {
    params: PropTypes.object,
    timestamp: PropTypes.string,
    url: PropTypes.string
  };

  render() {
    const { url } = this.props;

    return (
      <webview id="replay" src={url} autosize="on" plugins partition="persist:wr" />
    );
  }
}

export default Webview;
