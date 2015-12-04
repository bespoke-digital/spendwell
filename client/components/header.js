
import { Component } from 'react';
import { connect } from 'react-redux';

import { toggleNav } from 'state/nav';
import logoWhite from 'img/logo-white.svg';
import style from 'sass/components/header';


class Header extends Component {
  handleHamburgerClick(event) {
    event.preventDefault();
    this.props.dispatch(toggleNav());
  }

  render() {
    return (
      <nav className={`mui-appbar mui--z2 ${style.root}`}>
        <a
          className='hamburger mui--appbar-height mui--appbar-line-height'
          href='#'
          onClick={::this.handleHamburgerClick}
        >☰</a>
        <a className='brand mui--appbar-height mui--appbar-line-height' href='/'>
          <img src={logoWhite} alt='moneybase'/>
        </a>
      </nav>
    );
  }
}

export default connect((state)=> ({ auth: state.auth }))(Header);
