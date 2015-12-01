
import { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { pushState } from 'redux-router';

import Header from 'components/header';


export default class App extends Component {
  componentWillMount() {
    this.checkAuth(this.props);
  }

  componentWillReceiveProps(nextProps) {
    this.checkAuth(nextProps);
  }

  checkAuth(props) {
    if (!props.auth.authenticated) {
      this.props.dispatch(pushState(null, `/login?next=${props.location.pathname}`));
    }
  }

  render() {
    return (
      <div>
        <Header/>
        {this.props.auth.authenticated ? this.props.children : null}
      </div>
    );
  }
}

App.propTypes = {
  auth: PropTypes.object.isRequired,
};

export default connect((state)=> ({
  auth: state.auth,
}))(App);
