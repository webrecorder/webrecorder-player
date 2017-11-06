import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { ipcRenderer } from 'electron';
import { basename } from 'path';

import './style.scss';


class Indexing extends Component {

  static contextTypes = {
    router: PropTypes.object
  };

  static propTypes = {
    host: PropTypes.string
  }

  constructor(props) {
    super(props);

    this.interval = null;
    this.state = {
      data: null
    };
  }

  componentDidMount() {
    const { host } = this.props;
    const reqUrl = `${host}_upload/@INIT?user=local`;
    console.log(reqUrl);

    this.interval = setInterval(() => {
      fetch(reqUrl).then(res => res.json())
                   .then(this.displayProgress)
                   .catch(err => console.log(err));
    }, 250);
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  displayProgress = (data) => {
    if (data.done && data.done === '1') {
      clearInterval(this.interval);
      this.context.router.push('/local/collection');
    } else {
      this.setState({
        file: basename(data.filename),
        progress: (((data.size / data.total_size) * 100) + 0.5) | 0
      });
    }
  }

  render() {
    const { file, progress } = this.state;
    return (
      <div id="indexingContainer">
        <div className="progress-window">
          <h1>Please wait while the archive is indexed...</h1>
          <h3>Now Indexing: { file }</h3>
          <div className="progress-bar">
            <div className="progress" style={{ width: `${progress || 0}%` }} />
            <div className="progress-readout">{ `${progress || 0}%` }</div>
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = ({ app }) => {
  return {
    host: app.getIn(['appSettings', 'host'])
  };
};

export default connect(mapStateToProps)(Indexing);
