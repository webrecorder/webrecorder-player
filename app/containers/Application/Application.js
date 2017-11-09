import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { ipcRenderer } from 'electron';

import { Nav } from 'containers';

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

  componentDidMount() {
    document.addEventListener('drop', this.openDroppedFile);

    document.addEventListener('dragover', (evt) => {
      evt.preventDefault();
      evt.stopPropagation();
    });
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
    const filename = evt.dataTransfer.files[0].path;

    if (filename && filename.toString().match(/\.w?arc(\.gz)?|\.har$/)) {
      this.context.router.push('/');
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
        <div>
          <h1><a onClick={this.appReset}>Error Encountered, please try again.</a></h1>
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
