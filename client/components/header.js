
import { PropTypes, Component } from 'react';

import logoWhite from 'img/logo-white.svg';
import style from 'sass/components/header';


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
    const { navHandle } = this.props;
    return (
      <nav className={`mui-appbar mui--z2 ${style.root}`}>
        {navHandle ? (
          <a
            className='hamburger mui--appbar-height mui--appbar-line-height'
            href='#'
            onClick={::this.handleHandleClick}
          >☰</a>
        ) : null}
        <a className='brand mui--appbar-height mui--appbar-line-height' href='/'>
          <img src={logoWhite} alt='moneybase'/>
        </a>
      </nav>
    );
  }
}
