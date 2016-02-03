
import { PropTypes, Component } from 'react';
import Relay from 'react-relay';
import relayContainer from 'relay-decorator';

import Money from 'components/money';
import logoWhite from 'img/logo-white.svg';
import style from 'sass/components/header';


@relayContainer({
  fragments: {
    viewer: ()=> Relay.QL`
      fragment on Viewer {
        safeToSpend
      }
    `,
  },
})
export default class Header extends Component {
  static propTypes = {
    navHandle: PropTypes.bool,
    toggleNav: PropTypes.func,
  }

  static defaultProps = {
    navHandle: true,
  }

  handleHandleClick(event) {
    event.preventDefault();
    if (this.props.toggleNav)
      this.props.toggleNav();
  }

  render() {
    const { navHandle, viewer: { safeToSpend } } = this.props;
    return (
      <nav className={`mui-appbar mui--z2 ${style.root}`}>
        {navHandle ? (
          <a
            className='hamburger mui--appbar-height mui--appbar-line-height'
            href='#'
            onClick={::this.handleHandleClick}
          >☰</a>
        ) : null}
        <a className='brand mui--appbar-height mui--appbar-line-height' href='/app'>
          <img src={logoWhite} alt='SpendWell'/>
        </a>
        <div className='safe-to-spend'>
          <Money amount={safeToSpend}/>
        </div>
      </nav>
    );
  }
}
