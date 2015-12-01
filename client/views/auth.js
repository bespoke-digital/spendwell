
import { Component } from 'react';

import Header from 'components/header';


export default class Auth extends Component {
  render() {
    return <div>
      <Header/>
      {this.props.children}
    </div>;
  }
}
