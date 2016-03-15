
import { Component, PropTypes } from 'react';

import style from 'sass/components/transition';


export default class Transition extends Component {
  static propTypes = {
    show: PropTypes.bool.isRequired,
    name: PropTypes.string,
  };

  static defaultProps = {
    name: 'fade',
  };

  constructor() {
    super();
    this.state = { visible: false };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.show !== this.props.show)
      setTimeout(()=> this.setState({ visible: nextProps.show }), 1);
  }

  render() {
    const { name, show, children, ..._props } = this.props;
    const { visible } = this.state;

    return (
      <div className={`${style.root} ${name}-transition`} {..._props}>
        {show ?
          <div className={`${name} ${visible ? 'in' : ''}`}>
            {children}
          </div>
        : null}
      </div>
    );
  }
}
