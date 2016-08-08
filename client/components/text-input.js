
import _ from 'lodash'
import { Component, PropTypes } from 'react'

import style from 'sass/components/text-input'


export default class TextInput extends Component {
  static propTypes = {
    onChange: PropTypes.func.isRequired,
    label: PropTypes.string,
    value: PropTypes.string,
    initialValue: PropTypes.string,
    error: PropTypes.any,
    className: PropTypes.string,
    type: PropTypes.string,
    select: PropTypes.bool,
    autoFocus: PropTypes.bool,
  };

  static defaultProps = {
    error: false,
    className: '',
    type: 'text',
    select: false,
  };

  constructor ({ initialValue }) {
    super()
    this.state = { value: initialValue || '' }
  }

  componentDidMount () {
    const { select } = this.props
    if (select) {
      this.refs.input.select()
    }
  }

  changeValue (event) {
    const value = event.currentTarget.value

    if (_.isUndefined(this.props.value)) {
      this.setState({ value })
    }

    if (this.props.onChange) {
      this.props.onChange(value)
    }
  }

  render () {
    const { onChange, select, type, label, className, error, autoFocus, value, ..._props } = this.props
    const _value = _.isUndefined(value) ? this.state.value : value
    return (
      <div className={`
        mui-textfield
        ${label ? 'mui-textfield--float-label' : 'mui-textfield--no-label'}
        ${error ? 'mui-textfield--invalid' : ''}
        ${className}
        ${style.root}
      `}>
        <input
          type={type}
          onChange={::this.changeValue}
          value={_value}
          className={`
            ${_value ? 'mui--is-not-empty' : 'mui--is-empty'}
            ${error ? 'mui--is-invalid' : ''}
          `}
          autoFocus={autoFocus}
          ref='input'
          {..._props}
        />
        {label ? <label>{label}</label> : null}
        {_.isString(error) ? <span className='mui-textfield__help-text'>{error}</span> : null}
      </div>
    )
  }
}
