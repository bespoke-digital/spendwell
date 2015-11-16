
import { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { PropTypes as RouterPropTypes } from 'react-router';
import AppBar from 'material-ui/lib/app-bar';
import Tabs from 'material-ui/lib/tabs/tabs';
import Tab from 'material-ui/lib/tabs/tab';

class Header extends Component {
  onTabChange(value) {
    this.context.history.pushState(null, value);
  }

  render() {
    return (
      <AppBar
        title='moneybase'
        iconElementLeft={<span/>}
        iconElementRight={
          <Tabs onChange={::this.onTabChange} valueLink={{
            value: this.context.history.pathname,
            requestChange: ::this.onTabChange,
          }}>
            <Tab label='home' value='/'/>
            {this.props.auth.authenticated ? ([
              <Tab key={1} value='/connect' label='connect'/>,
              <Tab key={2} value='/logout' label='logout'/>,
            ]) : (
              <Tab value='/signup' label='get started'/>
            )}
          </Tabs>
        }
      />
    );
  }
}

Header.propTypes = {
  auth: PropTypes.object.isRequired,
};

Header.contextTypes = {
  history: RouterPropTypes.history,
};

export default connect((state)=> ({ auth: state.auth }))(Header);
