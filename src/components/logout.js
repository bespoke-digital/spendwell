
import { Component } from 'react';
import { connect } from 'react-redux';

import { logout } from 'state/auth';


class Logout extends Component {
  componentDidMount() {
    this.props.dispatch(logout());
    this.props.history.pushState(null, '/');
  }

  render() {
    return <div/>;
  }
}

export default connect()(Logout);
