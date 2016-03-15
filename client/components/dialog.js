
import { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';

import Card from 'components/card';

import style from 'sass/components/dialog';


class Dialog extends Component {
  static propTypes = {
    onRequestClose: PropTypes.func.isRequired,
    size: PropTypes.oneOf(['sm', 'md', 'lg']),
  };

  static defaultProps = {
    visible: false,
    size: 'md',
  };

  componentWillReceiveProps(nextProps) {
    this.insert(this.renderDialog(nextProps));
  }

  componentDidMount() {
    this.node = document.createElement('div');
    document.body.appendChild(this.node);

    this.insert(this.renderDialog(this.props));
  }

  componentWillUnmount() {
    ReactDOM.unmountComponentAtNode(this.node);
    document.body.removeChild(this.node);
  }

  insert(element) {
    ReactDOM.render(element, this.node);
  }

  renderDialog() {
    const { size, onRequestClose, children } = this.props;

    return (
      <div>
        <Card className={`${style.root} ${size}`}>
          {children}
        </Card>
        <div className='overlay' onClick={onRequestClose}/>
      </div>
    );
  }

  render() {
    return null;
  }
}

export default Dialog;
