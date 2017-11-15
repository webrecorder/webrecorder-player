import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { ipcRenderer } from 'electron';

import { setHost } from 'redux/modules/appSettings';
import { openFile } from 'helpers/utils';

import { Nav } from 'containers';

import pkg from 'package.json';

import 'shared/css/bootstrap-theme.min.css';
import 'shared/css/bootstrap.min.css';


class Application extends Component {
  static contextTypes = {
    router: PropTypes.object
  };

  static propTypes = {
    children: PropTypes.node
  };

  constructor(props) {
    super(props);

    this.state = { error: false };
  }

  componentWillMount() {
      document.title = `Webrecorder Player v${pkg.version}`;
  }

  componentDidMount() {
    document.addEventListener('drop', this.openDroppedFile);

    document.addEventListener('dragover', (evt) => {
      evt.preventDefault();
      evt.stopPropagation();
    });

    ipcRenderer.on('change-location', (evt, path) => {
      this.context.router.push(path);
    });

    ipcRenderer.on('open-warc-dialog', openFile.bind(this, this.context.router));
  }

  componentWillUnmount() {
    document.removeEventListever('drop', this.openDroppedFile);
  }

  componentDidCatch(error, info) {
    this.setState({ error, info });
  }

  openDroppedFile = (evt) => {
    evt.preventDefault();
    evt.stopPropagation();
    const { router } = this.context;
    const filename = evt.dataTransfer.files[0].path;

    if (filename && filename.toString().match(/\.w?arc(\.gz)?|\.har$/)) {
      if (router.routes[router.routes.length - 1].name !== 'landing') {
        router.push('/');
      }

      ipcRenderer.send('open-warc', filename.toString());
    } else if (filename) {
      window.alert('Sorry, only WARC or ARC files (.warc, .warc.gz, .arc, .arc.gz) or HAR (.har) can be opened');
    }
  }

  appReset = () => {
    this.context.router.replace('/');
    window.location.reload();
  }

  render() {
    const { error } = this.state;

    if (error) {
      return (
        <div id="landingContainer">
          <Nav />
          <div style={{ paddingLeft: '20px' }}>
            <h3><a onClick={this.appReset}>Error Encountered, please try again.</a></h3>
            <p>{ this.state.info }</p>
          </div>
        </div>
      );
    }

    return (
      <div id="root">
        <Nav />
        { this.props.children }
      </div>
    );
  }
}

export default Application;
