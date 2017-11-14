import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { Link } from 'react-router';

import { openFile } from 'helpers/utils';

import { Close, FileOpen, Help } from 'components/icons';
import { PlayerURLBar } from 'containers';

import './style.scss';


export default class Nav extends Component {
  static propTypes = {
    collectionLoaded: PropTypes.bool,
    canGoBackward: PropTypes.bool,
    canGoForward: PropTypes.bool,
    router: PropTypes.object
  };

  triggerBack = () => {
    if (this.props.canGoBackward) {
      window.dispatchEvent(new Event('wr-go-back'));
    }
  }

  triggerForward = () => {
    if (this.props.canGoForward) {
      window.dispatchEvent(new Event('wr-go-forward'));
    }
  }

  triggerRefresh = () => {
    window.dispatchEvent(new Event('wr-refresh'));
  }

  sendOpenFile = () => {
    openFile(this.props.router);
  }

  goToHelp = () => {
    this.props.router.push('/help');
  }

  render() {
    const { canGoBackward, canGoForward, collectionLoaded, router } = this.props;

    const indexUrl = collectionLoaded ? '/local/collection/' : '/';
    const route = router.routes[router.routes.length - 1];
    const isLanding = route && route.name === 'landing';
    const isReplay = route && route.name === 'replay';
    const isHelp = route && route.name === 'help';

    const fwdClass = classNames('button arrow', {
      inactive: !canGoForward,
      off: false
    });
    const backClass = classNames('button arrow', {
      inactive: !canGoBackward,
      off: false
    });

    return (
      <nav className={`topBar ${route.name}`}>
        <div className="logos">
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
        </div>

        {
          isReplay &&
            <div className="browser-nav">
              <button id="back" onClick={this.triggerBack} className={backClass} title="Click to go back">
                <object data={require('images/Back_Arrow.svg')} type="image/svg+xml" aria-label="navigate back" />
              </button>
              <button id="forward" onClick={this.triggerForward} className={fwdClass} title="Click to go forward">
                <object id="forwardArrow" data={require('images/Back_Arrow.svg')} type="image/svg+xml" aria-label="navigate forward" />
              </button>
              <button id="refresh" onClick={this.triggerRefresh} className="button arrow" title="Refresh replay window">
                <object data={require('images/Refresh.svg')} type="image/svg+xml" aria-label="refresh" />
              </button>

              <PlayerURLBar />
            </div>
        }

        <div className="player-functions">
          <button onClick={this.sendOpenFile} className="button grow" title="Open file">
            <FileOpen />
          </button>

          {
            isHelp ?
              <button id="help" onClick={router.goBack} className="button grow" title="Help">
                <Close />
              </button> :
              <button id="help" onClick={this.goToHelp} className="button grow" title="Help">
                <Help />
              </button>
          }
        </div>
      </nav>
    );
  }
}
