
import { Component, PropTypes } from 'react'

import style from 'sass/components/icon'


export default class Icon extends Component {
  static propTypes = {
    type: PropTypes.string.isRequired,
    color: PropTypes.oneOf(['dark', 'light']),
    size: PropTypes.oneOf([18, 24, 36, 48]),
    inactive: PropTypes.bool,
    className: PropTypes.string,
  };

  static defaultProps = {
    color: 'dark',
    size: 24,
    inactive: false,
    className: '',
  };

  render () {
    const { color, size, inactive, className, type } = this.props

    return (
      <i className={`
        ${style.root}
        material-icons
        icon
        icon-size-${size}
        icon-color-${color}
        ${inactive ? 'icon-inactive' : ''}
        ${className}
      `}>{type.replace(/\s/g, '_')}</i>
    )
  }
}
