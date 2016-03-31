
import { PropTypes, Component } from 'react';
import Relay from 'react-relay';
import { Link, browserHistory } from 'react-router';

import Money from 'components/money';
import logoWhite from 'img/logo-white.svg';
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
      viewer: { safeToSpend },
      showSafeToSpend,
      navHandle,
      back,
      logoLink,
    } = this.props;

    return (
      <nav className={`mui-appbar mui--z2 ${style.root}`}>
        <div className='left mui--appbar-height mui--appbar-line-height'>
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
        {logoLink ?
          <Link className='brand mui--appbar-height mui--appbar-line-height' to='/app/dashboard'>
            <img src={logoWhite} alt='Spendwell' className='logo'/>
            <img src={logoIconWhite} alt='Spendwell' className='icon'/>
          </Link>
        :
          <div className='brand mui--appbar-height mui--appbar-line-height'>
            <img src={logoWhite} alt='Spendwell' className='logo'/>
            <img src={logoIconWhite} alt='Spendwell' className='icon'/>
          </div>
        }
        {showSafeToSpend ?
          <div className='safe-to-spend'>
            <Money amount={safeToSpend}/>
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
        safeToSpend
      }
    `,
  },
});

export default Header;
