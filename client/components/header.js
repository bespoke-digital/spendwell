
import { Component } from 'react';
import { connect } from 'react-redux';
import { PropTypes as RouterPropTypes } from 'react-router';
import { Link } from 'react-router';

import logoWhite from 'img/logo-white.svg';
import style from 'sass/components/header.scss';


class NavLink extends Component {
  render() {
    const isActive = this.context.history.isActive(this.props.to, this.props.query);
    return (
      <li className={isActive ? 'active' : ''}>
        <Link to={this.props.to}>{this.props.children}</Link>
      </li>
    );
  }
}

NavLink.contextTypes = {
  history: RouterPropTypes.history,
};


class Header extends Component {
  render() {
    return (
      <nav className={`mui-appbar mui--z2 ${style.root}`}>
        <div className='container'>

          <a className='brand mui--appbar-height mui--appbar-line-height' href='/'>
            <img src={logoWhite} alt='moneybase'/>
          </a>

          {this.props.auth.authenticated ? (
            <ul className='nav list-inline mui--appbar-height mui--appbar-line-height'>
              <NavLink key='dashboard' to='/dashboard'>Dashboard</NavLink>
              <NavLink key='accounts' to='/accounts'>Accounts</NavLink>
              <NavLink key='logout' to='/logout'>Logout</NavLink>
            </ul>
          ) : null}
        </div>
      </nav>
    );
  }
}

export default connect((state)=> ({ auth: state.auth }))(Header);
