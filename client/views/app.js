
import { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { pushState } from 'redux-router';

import Header from 'components/header';
import Nav from 'components/nav';

import style from 'sass/views/app';


export default class App extends Component {
  static propTypes = {
    auth: PropTypes.object.isRequired,
    nav: PropTypes.object.isRequired,
  }

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
    if (!this.props.auth.authenticated) return <div/>;

    const { nav, children } = this.props;

    return (
      <div className={`${style.root} ${nav.open ? 'nav-open' : ''}`}>
        <Header/>
        <Nav open={nav.open}/>
        {children}
      </div>
    );
  }
}

export default connect((state)=> ({
  auth: state.auth,
  nav: state.nav,
}))(App);
