
import { Link } from 'react-router';
import { Component, PropTypes } from 'react';
import Relay from 'react-relay';

import style from 'sass/components/nav';


const isActive = (path)=> document.location.pathname.indexOf(path) === 0;


class Nav extends Component {
  static propTypes = {
    open: PropTypes.bool.isRequired,
    toggleNav: PropTypes.func.isRequired,
  };

  render() {
    const { viewer, toggleNav, open } = this.props;

    return (
      <div className={`${style.root} ${open ? 'open' : ''}`}>

        <div className='account-info'>
          <div className='account-email'>{viewer.email}</div>
        </div>

        <ul className='list-unstyled'>
          <li className={isActive('/app/dashboard') ? 'active' : ''}>
            <Link onClick={toggleNav} to='/app/dashboard'>
              <i className='fa fa-fw fa-tachometer'/>
              Dashboard
            </Link>
          </li>
          {/*
          <li className={isActive('/app/transactions') ? 'active' : ''}>
            <Link onClick={toggleNav} to='/app/transactions'>
              <i className='fa fa-fw fa-list'/>
              Transactions
            </Link>
          </li>
          */}
          <li className={isActive('/app/accounts') ? 'active' : ''}>
            <Link onClick={toggleNav} to='/app/accounts'>
              <i className='fa fa-fw fa-university'/>
              Accounts
            </Link>
          </li>
          <li>
            <a href='/logout?next=/login'>
              <i className='fa fa-fw fa-power-off'/>
              Logout
            </a>
          </li>
        </ul>
      </div>
    );
  }
}

Nav = Relay.createContainer(Nav, {
  fragments: {
    viewer() {
      return Relay.QL`
        fragment on Viewer {
          email
        }
      `;
    },
  },
});

export default Nav;
