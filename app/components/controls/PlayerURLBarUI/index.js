import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { updateUrl } from 'redux/modules/controls';

import { InfoWidget } from 'containers';
import TimeFormat from 'components/TimeFormat';

import './style.scss';


class PlaeryURLBarUI extends Component {
  static propTypes = {
    bookmarkTitle: PropTypes.string,
    dispatch: PropTypes.func,
    timestamp: PropTypes.string,
    url: PropTypes.string
  };

  constructor(props) {
    super(props);

    this.state = { url: props.url };
  }

  componentWillReceiveProps(nextProps) {
    if(nextProps.url !== this.props.url) {
      this.setState({ url: nextProps.url });
    }
  }

  changeUrl = () => {
    const { dispatch } = this.props;
    const { url } = this.state;

    dispatch(updateUrl(url));
  }

  handleInput = (evt) => {
    evt.preventDefault();
    this.setState({ url: evt.target.value });
  }

  handleSubmit = (evt) => {
    if (evt.key === 'Enter') {
      this.changeUrl();
    }
  }

  render() {
    const { bookmarkTitle, timestamp } = this.props;
    const { url } = this.state;

    return (
      <ul className="player-url" title="Bookmark list">
        <li>
          <div className="bookmark-title">
            <input value={bookmarkTitle} readOnly />
          </div>
          <span className="timestamp-label hidden-xs">Archived on</span>
        </li>
        <li>
          <div className="bookmark-url">
            <input id="url" type="text" onClick={this.toggle} onChange={this.handleInput} onKeyPress={this.handleSubmit} name="url" value={url} autoComplete="off" />
          </div>
          <div className="replay-date hidden-xs">
            <InfoWidget />
            <TimeFormat dt={timestamp} />
          </div>
        </li>
      </ul>
    );
  }
}

export default PlaeryURLBarUI;
