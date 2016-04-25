
import { Component, PropTypes } from 'react';

import style from 'sass/components/icon';


export default class Icon extends Component {
  static propTypes = {
    className: PropTypes.string,
    color: PropTypes.string,
  };

  static defaultProps = {
    className: '',
    color: 'black',
  };

  render() {
    const { color, className } = this.props;

    return (
      <svg
        viewBox='0 0 24 24'
        preserveAspectRatio='xMidYMid meet'
        className={`${style.root} icon icon-${this.type} icon-color-${color} ${className}`}
        fit
      >
        {this.renderInternal()}
      </svg>
    );
  }
}
