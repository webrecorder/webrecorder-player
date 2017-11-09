import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';

import Nav from 'components/Nav';


const mapStateToProps = ({ app }) => {
  return {
    collectionLoaded: app.getIn(['collection', 'loaded']),
    canGoBackward: app.getIn(['appSettings', 'canGoBackward']),
    canGoForward: app.getIn(['appSettings', 'canGoForward'])
  };
}

export default connect(mapStateToProps)(withRouter(Nav));