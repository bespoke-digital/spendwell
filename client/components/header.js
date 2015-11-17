
import { Component } from 'react';
import { connect } from 'react-redux';
import { PropTypes as RouterPropTypes } from 'react-router';
import { Link } from 'react-router';

import logoWhite from 'img/logo-white.svg';


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
      <nav className='navbar'>
        <div className='container'>

          <div className='navbar-header'>
            <button type='button' className='navbar-toggle collapsed'>
              <span className='sr-only'></span>
              <i className='fa fa-bars'></i>
            </button>
            <a className='navbar-brand' href='/'>
              <img src={logoWhite} alt='moneybase'/>
            </a>
          </div>

          <div className='collapse navbar-collapse'>
            <ul className='nav navbar-nav navbar-right'>
              <NavLink to='/'>Dashboard</NavLink>
              {this.props.auth.authenticated ? ([
                <NavLink key={1} to='/connect'>connect</NavLink>,
                <NavLink key={2} to='/logout'>Logout</NavLink>,
              ]) : (
                <NavLink to='/signup'>Get Started</NavLink>
              )}
            </ul>
          </div>
        </div>
      </nav>
    );
  }
}

export default connect((state)=> ({ auth: state.auth }))(Header);
