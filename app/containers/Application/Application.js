import React, { Component } from 'react';
import { connect } from 'react-redux';
import { ipcRenderer } from 'electron';
import PropTypes from 'prop-types';
import { Link } from 'react-router';

import Nav from 'components/Nav';

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

  componentDidCatch(error, info) {
    this.setState({ error, info });
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

  openDroppedFile = (evt) => {
    evt.preventDefault();
    evt.stopPropagation();
    const filename = evt.dataTransfer.files[0].path;
    console.log(filename);

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
    const { children, colectionLoaded } = this.props;

    if (error) {
      return (
        <div>
          <h1><a onClick={this.appReset}>Error Encountered, please try again.</a></h1>
        </div>
      );
    }

    return [
      <Nav key="navigation" collectionLoaded={colectionLoaded} />,
      children
    ];
  }
}

const mapStateToProps = (state) => {
  return {
    colectionLoaded: state.getIn(['collection', 'loaded'])
  };
}

export default connect(mapStateToProps)(Application);
