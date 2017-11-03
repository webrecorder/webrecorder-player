import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { ipcRenderer } from 'electron';
import { connect } from 'react-redux';

import { setHost } from 'redux/modules/appSettings';
import { openFile } from 'helpers/utils';

import './style.scss';


class Landing extends Component {

  static contextTypes = {
    router: PropTypes.object
  };

  static propTypes = {
    dispatch: PropTypes.func
  }

  constructor(props) {
    super(props);

    this.state = { initializing: false };
  }

  componentDidMount() {
    ipcRenderer.once('initializing', () => this.setState({ initializing: true }));
    ipcRenderer.once('indexing', (evt, data) => {
      this.props.dispatch(setHost(data));
      this.context.router.push('/indexing');
    });
  }

  render() {
    const { initializing } = this.state;

    return (
      <div id="landingContainer">
        {
          initializing ?
            <img src={require('images/loading.svg')} id="loadingGif" alt="loading" /> :
            <div className="bigOpen">
              <button onClick={openFile}>
                <object id="loadWarc" data={require('images/Load_WARC.svg')} type="image/svg+xml">load</object>
              </button>
            </div>
        }

        <div className="projectByRhizome">
          <p>
            A project by<br />
            <img src={require('images/Current-Rhizome-Logo-Trimmed.png')} alt="rhizome logo" />
          </p>
        </div>
      </div>
    );
  }
}


export default connect()(Landing);
