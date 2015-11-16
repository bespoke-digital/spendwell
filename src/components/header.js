
import { Component, PropTypes } from 'react';
import { Link } from 'react-router';
import { connect } from 'react-redux';


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
            <Link className='navbar-brand' to='/'>moneybase</Link>
          </div>

          <div className='collapse navbar-collapse' id='bs-example-navbar-collapse-1'>
            <ul className='nav navbar-nav navbar-right'>
              <li><Link to='/'>home</Link></li>
              {this.props.auth.authenticated ? ([
                <li key={1}><Link to='/connect'>connect</Link></li>,
                <li key={2}><Link to='/logout'>logout</Link></li>,
              ]) : (
                <li><Link to='/signup'>get started</Link></li>
              )}
            </ul>
          </div>
        </div>
      </nav>
    );
  }
}

Header.propTypes = {
  auth: PropTypes.object.isRequired,
};

export default connect((state)=> ({ auth: state.auth }))(Header);
