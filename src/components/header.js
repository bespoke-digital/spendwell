
import { Component } from 'react';
import { Link } from 'react-router';


export default class Header extends Component {
  render() {
    return (
      <nav className='navbar'>
        <div className='container'>

          <div className='navbar-header'>
            <button type='button' className='navbar-toggle collapsed'>
              <span className='sr-only'></span>
              <i className='fa fa-bars'></i>
            </button>
            <Link className='navbar-brand' to='/'>moneybase</Link>
          </div>

          <div className='collapse navbar-collapse' id='bs-example-navbar-collapse-1'>
            <ul className='nav navbar-nav navbar-right'>
              <li><Link to='/'>home</Link></li>
              <li><Link to='/connect'>connect</Link></li>
            </ul>
          </div>
        </div>
      </nav>
    );
  }
}
