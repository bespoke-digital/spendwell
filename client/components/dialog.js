
import { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';

import Card from 'components/card';

import style from 'sass/components/dialog';


class Dialog extends Component {
  static propTypes = {
    onRequestClose: PropTypes.func.isRequired,
    size: PropTypes.oneOf(['sm', 'md', 'lg']),
    className: PropTypes.string,
  };

  static defaultProps = {
    visible: false,
    size: 'md',
    className: '',
  };

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
    const { size, onRequestClose, className, children } = this.props;

    return (
      <div>
        <Card className={`${style.root} ${size} ${className}`}>
          {children}
        </Card>
        <div className='overlay' onClick={onRequestClose}/>
      </div>
    );
  }
}

export default Dialog;
