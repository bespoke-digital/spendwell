
import _ from 'lodash'
import { Component, PropTypes } from 'react'

import TextInput from 'components/text-input'

export default class MoneyInput extends Component {
  static propTypes = {
    onChange: PropTypes.func.isRequired,
    initialValue: PropTypes.number,
  };

  state = {
    valid: true,
  };

  onChange (value) {
    const numberValue = parseInt(parseFloat(value.replace(/[\$,]/g, '')) * 100)
    const valid = !_.isNaN(numberValue)

    this.setState({ value, valid })

    if (valid && this.props.onChange) {
      this.props.onChange(numberValue)
    }
  }

  render () {
    const { onChange, initialValue, ..._props } = this.props
    const { value, valid } = this.state

    return (
      <TextInput
        onChange={::this.onChange}
        value={_.isUndefined(value) ? (initialValue / 100).toString() : value}
        error={!valid}
        {..._props}
      />
    )
  }
}
