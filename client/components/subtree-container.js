
import { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';

import store from 'store';


// Here Be Dragons
// Had to use a "secret" feature of ReactDOM to render outside the main
// react tree without breaking context, which would break relay.
const renderSubtreeIntoContainer = ReactDOM.unstable_renderSubtreeIntoContainer;


export default class SubtreeContainer extends Component {
  static propTypes = {
    stealScroll: PropTypes.bool,
  };

  static defaultProps = {
    stealScroll: false,
  };

  componentDidMount() {
    this.node = document.body.appendChild(document.createElement('div'));
    this.mounted = true;
    this.insert(this.props);
  }

  componentWillReceiveProps(props) {
    this.insert(props);
  }

  componentWillUnmount() {
    const { stealScroll } = this.props;

    ReactDOM.unmountComponentAtNode(this.node);
    document.body.removeChild(this.node);
    this.mounted = false;

    if (stealScroll)
      store.dispatch({ type: 'RELEASE_SCROLL' });
  }

  insert(props) {
    const { stealScroll } = props;

    // If we don't clear the stack before this render state won't be updated
    // yet in the rendered tree. Since we clear the stack, we have to make
    // sure the node is still mounted when we render.
    setTimeout(()=> this.mounted ? renderSubtreeIntoContainer(this, this.subtreeRender(), this.node) : null, 0);

    console.log('stealScroll', stealScroll);
    if (stealScroll)
      store.dispatch({ type: 'LOCK_SCROLL' });
    else
      store.dispatch({ type: 'RELEASE_SCROLL' });
  }

  subtreeRender() {
    const { children } = this.props;
    return <span>{children}</span>;
  }

  render() {
    return <span/>;
  }
}
