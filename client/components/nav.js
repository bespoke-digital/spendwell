
import { Component, PropTypes } from 'react';
import Relay from 'react-relay';

import A from 'components/a';
import Icon from 'components/icon';
import logo from 'img/logo-green.svg';
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

        <div className='logo'>
          <img src={logo} alt='Spendwell'/>
        </div>

        <ul className='list-unstyled'>
          <li className={isActive('/app/dashboard') ? 'active' : ''}>
            <A onClick={toggleNav} href='/app/dashboard'>
              <Icon type='local atm'/>
              <div className='label'>Dashboard</div>
            </A>
          </li>
          <li className={isActive('/app/transactions') ? 'active' : ''}>
            <A onClick={toggleNav} href='/app/transactions'>
              <Icon type='view list'/>
              <div className='label'>Transactions</div>
            </A>
          </li>
          <li className={isActive('/app/accounts') ? 'active' : ''}>
            <A onClick={toggleNav} href='/app/accounts'>
              <Icon type='account balance'/>
              <div className='label'>Accounts</div>
            </A>
          </li>
          <li>
            <a href='/logout?next=/login'>
              <Icon type='power settings new'/>
              <div className='label'>Logout</div>
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
