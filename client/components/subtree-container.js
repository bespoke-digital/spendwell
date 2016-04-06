
import { Component } from 'react';
import ReactDOM from 'react-dom';


export default class SubtreeContainer extends Component {
  componentDidMount() {
    this.node = document.body.appendChild(document.createElement('div'));
    this.insert();
  }

  componentWillReceiveProps() {
    this.insert();
  }

  componentWillUnmount() {
    ReactDOM.unmountComponentAtNode(this.node);
    document.body.removeChild(this.node);
  }

  insert() {
    // Here Be Dragons
    // Had to use a "secret" feature of ReactDOM to render outside the main
    // react tree without breaking all the things.
    ReactDOM.unstable_renderSubtreeIntoContainer(this, this.props.children, this.node);
  }

  render() {
    return <span>{this.props.children}</span>;
  }
}
