import React from 'react';
import { connect } from 'react-redux';

import { getBookmarkTitle } from 'redux/selectors';

import { PlayerURLBarUI } from 'components/controls';


const mapStateToProps = (outerState) => {
  const { app } = outerState;

  return {
    bookmarkTitle: app.getIn(['controls', 'title']) || getBookmarkTitle(outerState),
    timestamp: app.getIn(['controls', 'timestamp']),
    url: app.getIn(['controls', 'url']),
  };
};

export default connect(
  mapStateToProps
)(PlayerURLBarUI);
