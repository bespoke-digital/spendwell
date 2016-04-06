
import { Component } from 'react';
import ReactDOM from 'react-dom';


// Here Be Dragons
// Had to use a "secret" feature of ReactDOM to render outside the main
// react tree without breaking context, which would break relay.
const renderSubtreeIntoContainer = ReactDOM.unstable_renderSubtreeIntoContainer;


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
    // If we don't clear the stack before this render state gets fucked.
    setTimeout(()=> renderSubtreeIntoContainer(this, this.subtreeRender(), this.node), 0);
  }

  subtreeRender() {
    const { children } = this.props;
    return <span>{children}</span>;
  }

  render() {
    return <span/>;
  }
}
