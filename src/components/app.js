
import { Component, PropTypes } from 'react';

import Header from './header';
import socket from '../socket';


export default class App extends Component {
  getChildContext() {
    return { socket };
  }

  render() {
    return <div>
      <Header/>
      {this.props.children}
    </div>;
  }
}

App.childContextTypes = {
  socket: PropTypes.object.isRequired,
};
