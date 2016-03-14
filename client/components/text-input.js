
import _ from 'lodash';
import { Component, PropTypes } from 'react';

import style from 'sass/components/text-input';


export default class TextInput extends Component {
  static propTypes = {
    onChange: PropTypes.func.isRequired,
    value: PropTypes.string,
    error: PropTypes.string,
    className: PropTypes.string,
    type: PropTypes.string,
  };

  static defaultProps = {
    className: '',
    type: 'text',
  };

  constructor() {
    super();
    this.state = {};
  }

  changeValue(event) {
    const value = event.currentTarget.value;

    if (_.isUndefined(this.props.value))
      this.setState({ value });

    if (this.props.onChange)
      this.props.onChange(value);
  }

  render() {
    const { onChange, type, label, className, error, autoFocus, value, ..._props } = this.props;
    const _value = _.isUndefined(value) ? this.state.value : value;

    return (
      <div className={`
        mui-textfield
        ${label ? 'mui-textfield--float-label' : ''}
        ${error ? 'mui-textfield--invalid' : ''}
        ${className}
        ${style.root}
      `}>
        <input
          type={type}
          onChange={::this.changeValue}
          value={_value}
          className={_value ? 'mui--is-not-empty' : ''}
          autoFocus={autoFocus}
          {..._props}
        />
        {label ? <label>{label}</label> : null}
        {error ? <span className='mui-textfield__help-text'>{error}</span> : null}
      </div>
    );
  }
}
