
import { PropTypes, Component } from 'react';
import Relay from 'react-relay';
import { Link, browserHistory } from 'react-router';

import Money from 'components/money';
import OnboardProgress from 'components/onboard-progress';

import logoIconWhite from 'img/logo-icon-white.svg';

import style from 'sass/components/header';


class Header extends Component {
  static propTypes = {
    toggleNav: PropTypes.func,
    navHandle: PropTypes.bool,
    showSafeToSpend: PropTypes.bool,
    back: PropTypes.bool,
    logoLink: PropTypes.bool,
  };

  static defaultProps = {
    navHandle: true,
    showSafeToSpend: true,
    back: false,
    logoLink: true,
  };

  handleHandleClick(event) {
    event.preventDefault();
    if (this.props.toggleNav)
      this.props.toggleNav();
  }

  handleBackClick(event) {
    event.preventDefault();
    browserHistory.goBack();
  }

  render() {
    const {
      viewer,
      showSafeToSpend,
      navHandle,
      back,
      logoLink,
    } = this.props;

    return (
      <nav className={`mui-appbar ${style.root}`}>
        <div className='nav-handle mui--appbar-height mui--appbar-line-height'>
          {back ? (
            <a href='#' onClick={::this.handleBackClick}>
              <i className='fa fa-long-arrow-left'/>
            </a>
          ) : navHandle ? (
            <a href='#' onClick={::this.handleHandleClick}>
              <i className='fa fa-bars'/>
            </a>
          ) : null}
        </div>

        <OnboardProgress viewer={viewer}/>

        {logoLink ?
          <Link className='brand mui--appbar-height mui--appbar-line-height' to='/app/dashboard'>
            <img src={logoIconWhite} alt='Spendwell'/>
          </Link>
        :
          <div className='brand mui--appbar-height mui--appbar-line-height'>
            <img src={logoIconWhite} alt='Spendwell'/>
          </div>
        }

        {showSafeToSpend ?
          <div className='safe-to-spend'>
            <Money amount={viewer.safeToSpend}/>
            <small>safe to spend</small>
          </div>
        : null}
      </nav>
    );
  }
}

Header = Relay.createContainer(Header, {
  fragments: {
    viewer: ()=> Relay.QL`
      fragment on Viewer {
        ${OnboardProgress.getFragment('viewer')}

        safeToSpend
      }
    `,
  },
});

export default Header;
