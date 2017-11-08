import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router';

import { openFile } from 'helpers/utils';

import './style.scss';


class Nav extends Component {
  static contextTypes = {
    router: PropTypes.object,
    route: PropTypes.object
  };

  static propTypes = {
    collectionLoaded: PropTypes.bool,
  };

  render() {
    const { router } = this.context;
    const { collectionLoaded } = this.props;

    const route = router.routes[router.routes.length - 1];
    const isLanding = route && route.name === 'landing';
    const isReplay = route && route.name === 'replay';
    const isHelp = route && route.name === 'help';
    const indexUrl = collectionLoaded ? '/local/collection/' : '/';

    return (
      <nav className={`topBar ${route.name}`}>
        <Link to={indexUrl} className="button home-btn">
          <img className="wrLogoImg" src={require('images/WebRecorder_Logo-Only.png')} alt="webrecorder logo" /><br />
          <img className="wrLogoPlayerTxt" src={require('images/PLAYER_text.png')} alt="webrecorder logo" />
        </Link>
        {
          isLanding &&
            <Link to={indexUrl} className="button home-btn">
              <img className="wrLogoImgTxt" src={require('images/Webrecorder_Player_logo_text.png')} alt="webrecorder logo" />
            </Link>
        }

        {
          isReplay &&
            <div className="browser-nav">
              <button id="back" className="button arrow off" title="Click to go back">
                <object data="images/Back_Arrow.svg" type="image/svg+xml" aria-label="navigate back" />
              </button>
              <button id="forward" className="button arrow off" title="Click to go forward">
                <object id="forwardArrow" data="images/Back_Arrow.svg" type="image/svg+xml" aria-label="navigate forward" />
              </button>
              <button id="refresh" className="button arrow off" title="Refresh replay window">
                <object data="images/Refresh.svg" type="image/svg+xml" aria-label="refresh" />
              </button>
            </div>
        }

        <div className="pull-right">
          {
            isReplay &&
              <Link to="/local/collection">
                <img className="backToColl" src={require('images/Back_to_Coll.png')} alt="back to collection" />
              </Link>
          }
          <button onClick={openFile} className="button grow" title="Open file">
            <img className="openFile" src={require('images/OpenFileICO.png')} alt="open file" />
          </button>

          {
            isHelp ?
              <button id="help" onClick={router.goBack} className="button grow" title="Help">
                <img className="halp" src={require('images/close.png')} alt="help page" />
              </button> :
              <Link to="/help">
                <button id="help" className="button grow" title="Help">
                  <img className="halp" src={require('images/halp.png')} alt="help page" />
                </button>
              </Link>
          }
        </div>
      </nav>
    );
  }
}

export default Nav;
