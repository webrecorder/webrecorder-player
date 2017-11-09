import React, { Component } from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';

import { updateUrlAndTimestamp } from 'redux/modules/controls';

import { rts } from 'helpers/utils';

import TimeFormat from 'components/TimeFormat';


class BookmarkListItem extends Component {
  static contextTypes = {
    canAdmin: PropTypes.bool,
    router: PropTypes.object
  };

  static propTypes = {
    closeList: PropTypes.func,
    dispatch: PropTypes.func,
    page: PropTypes.object,
    params: PropTypes.object,
    ts: PropTypes.string,
    url: PropTypes.string,
  };

  shouldComponentUpdate(nextProps) {
    const { page, ts, url } = this.props;

    if (nextProps.page === page &&
        nextProps.ts === ts &&
        nextProps.url === url) {
      return false;
    }

    return true;
  }

  changeUrl = () => {
    const { closeList, dispatch, page, params: { user, coll } } = this.props;

    closeList();
    dispatch(updateUrlAndTimestamp(page.get('url'), page.get('timestamp')));
  }

  render() {
    const { page, ts, url } = this.props;
    const classes = classNames({ active: rts(url) === rts(page.get('url')) && ts === page.get('timestamp') });

    return (
      <li
        className={classes}
        onClick={this.changeUrl}
        role="button"
        title={page.get('url')}>
        {
          !__PLAYER__ && page.get('browser') &&
            <img src={`/api/browsers/browsers/${page.get('browser')}/icon`} alt="Browser icon" />
        }
        <div className="url">
          { page.get('url') }
        </div>
        <span className="replay-date hidden-xs"><TimeFormat dt={page.get('timestamp')} /></span>
      </li>
    );
  }
}

export default BookmarkListItem;
