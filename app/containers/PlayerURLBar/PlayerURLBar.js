import React from 'react';
import { connect } from 'react-redux';

import { getBookmarkTitle } from 'redux/selectors';

import { PlayerURLBarUI } from 'components/controls';


const mapStateToProps = ({ app }) => {
  return {
    bookmarkTitle: getBookmarkTitle(app),
    timestamp: app.getIn(['controls', 'timestamp']),
    url: app.getIn(['controls', 'url']),
  };
};

export default connect(
  mapStateToProps
)(PlayerURLBarUI);
