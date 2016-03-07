
import _ from 'lodash';
import { Component, PropTypes } from 'react';


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
    const { type, label, className, error, autofocus } = this.props;
    const value = !_.isUndefined(this.props.value) ? this.props.value : this.state.value;

    return (
      <div className={`
        mui-textfield
        ${label ? 'mui-textfield--float-label' : ''}
        ${error ? 'mui-textfield--invalid' : ''}
        ${className}
      `}>
        <input
          type={type}
          onChange={::this.changeValue}
          value={value}
          className={value ? 'mui--is-not-empty' : ''}
          autofocus={autofocus}
        />
        {label ? <label>{label}</label> : null}
        {error ? <span className='mui-textfield__help-text'>{error}</span> : null}
      </div>
    );
  }
}
