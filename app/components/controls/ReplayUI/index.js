import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Map } from 'immutable';

import { ReplayURLBar } from 'components/controls';

import './style.scss';


class ReplayUI extends Component {
  static propTypes = {
    activeCollection: PropTypes.object,
    bookmarks: PropTypes.object,
    params: PropTypes.object,
    timestamp: PropTypes.string,
    url: PropTypes.string
  };

  static defaultProps = {
    bookmarks: Map(),
  };

  static contextTypes = {
    currMode: PropTypes.string
  };

  render() {
    return (
      <div role="presentation" className="container-fluid wr-controls navbar-default">
        <ReplayURLBar {...this.props} />
      </div>
    );
  }
}

export default ReplayUI;
