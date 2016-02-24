
import { PropTypes, Component } from 'react';
import Relay from 'react-relay';

import Money from 'components/money';
import logoWhite from 'img/logo-white.svg';
import logoIconWhite from 'img/logo-icon-white.svg';
import style from 'sass/components/header';


class Header extends Component {
  static propTypes = {
    navHandle: PropTypes.bool,
    showSafeToSpend: PropTypes.bool,
    toggleNav: PropTypes.func,
  };

  static defaultProps = {
    navHandle: true,
    showSafeToSpend: true,
  };

  handleHandleClick(event) {
    event.preventDefault();
    if (this.props.toggleNav)
      this.props.toggleNav();
  }

  render() {
    const { showSafeToSpend, navHandle, viewer: { safeToSpend } } = this.props;
    return (
      <nav className={`mui-appbar mui--z2 ${style.root}`}>
        {navHandle ? (
          <a
            className='hamburger mui--appbar-height mui--appbar-line-height'
            href='#'
            onClick={::this.handleHandleClick}
          >
            <i className='fa fa-bars'/>
          </a>
        ) : null}
        <a className='brand mui--appbar-height mui--appbar-line-height' href='/app'>
          <img src={logoWhite} alt='Spendwell' className='logo'/>
          <img src={logoIconWhite} alt='Spendwell' className='icon'/>
        </a>
        {showSafeToSpend ?
          <div className='safe-to-spend'>
            <small>Safe To Spend</small>
            <Money amount={safeToSpend}/>
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
