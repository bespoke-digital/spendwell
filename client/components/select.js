
import _ from 'lodash'
import { Component, PropTypes } from 'react'

import Dropdown from 'components/dropdown'
import A from 'components/a'

export default class Select extends Component {
  static propTypes = {
    onChange: PropTypes.func.isRequired,
    options: PropTypes.arrayOf(
      PropTypes.shape({ label: PropTypes.string, value: PropTypes.any })
    ).isRequired,
    label: PropTypes.string.isRequired,
    selectedLabel: PropTypes.bool,
    value: PropTypes.any,
    initialValue: PropTypes.any,
    variant: PropTypes.oneOf(['primary', 'danger', 'accent']),
    className: PropTypes.string,
  };

  static defaultProps = {
    className: '',
    selectedLabel: true,
  };

  state = {
    value: null,
  };

  isControled () {
    return !!this.props.value
  }

  value () {
    return this.isControled() ? this.props.value : this.state.value
  }

  handleOptionClick (value) {
    const { onChange } = this.props

    if (!this.isControled()) {
      this.setState({ value })
    }

    onChange(value)
  }

  render () {
    const { initialValue, selectedLabel, label, options, variant, className } = this.props

    let value
    if (this.isControled()) {
      value = this.props.value
    } else {
      value = this.state.value || initialValue
    }

    const valueLabel = _.result(_.find(options, { value }), 'label')

    return (
      <span className={className}>
        <Dropdown
          label={
            valueLabel && selectedLabel ? `${label}: ${valueLabel}` : valueLabel || label
          }
          variant={variant}
        >
          {options.map((option, index) => (
            <A key={index} onClick={this.handleOptionClick.bind(this, option.value)}>
              {option.label}
            </A>
          ))}
        </Dropdown>
      </span>
    )
  }
}
