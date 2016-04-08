
import { Component } from 'react';
import ReactDOM from 'react-dom';


// Here Be Dragons
// Had to use a "secret" feature of ReactDOM to render outside the main
// react tree without breaking context, which would break relay.
const renderSubtreeIntoContainer = ReactDOM.unstable_renderSubtreeIntoContainer;


export default class SubtreeContainer extends Component {
  componentDidMount() {
    this.node = document.body.appendChild(document.createElement('div'));
    this.mounted = true;
    this.insert();
  }

  componentWillReceiveProps() {
    this.insert();
  }

  componentWillUnmount() {
    ReactDOM.unmountComponentAtNode(this.node);
    document.body.removeChild(this.node);
    this.mounted = false;
  }

  insert() {
    // If we don't clear the stack before this render state won't be updated
    // yet in the rendered tree. Since we clear the stack, we have to make
    // sure the node is still mounted when we render.
    setTimeout(()=> this.mounted ? renderSubtreeIntoContainer(this, this.subtreeRender(), this.node) : null, 0);
  }

  subtreeRender() {
    const { children } = this.props;
    return <span>{children}</span>;
  }

  render() {
    return <span/>;
  }
}
