
import { Component, PropTypes } from 'react';


export default class Logout extends Component {
  static propTypes = {
    history: PropTypes.object.isRequired,
  };

  componentDidMount() {
    Meteor.logout();
    this.props.history.push({ pathname: '/login' });
  }

  render() {
    return <div/>;
  }
}
