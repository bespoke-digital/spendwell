
import _ from 'lodash';
import { Component, PropTypes } from 'react';

import style from 'sass/components/forms/input';


export default class FileInput extends Component {
  static propTypes = {
    value: PropTypes.string,
    error: PropTypes.string,
    label: PropTypes.string,
    onChange: PropTypes.func,
  };

  static defaultProps = {
    className: '',
  };

  constructor() {
    super();
    this.state = {};
  }

  changeValue(event) {
    const value = event.currentTarget.files;

    if (_.isUndefined(this.props.value))
      this.setState({ value });

    if (this.props.onChange)
      this.props.onChange(value);
  }

  render() {
    const { label, className, error } = this.props;
    const value = !_.isUndefined(this.props.value) ? this.props.value : this.state.value;

    return (
      <div className={`
        mui-textfield
        ${error ? 'mui-textfield--invalid' : ''}
        ${style.root}
        ${className}
      `}>
        <input
          type='file'
          onChange={::this.changeValue}
          className={value ? 'mui--is-not-empty' : ''}
        />
        {label ? <label>{label}</label> : null}
        {error ? (
          <span className='mui-textfield__help-text'>{error}</span>
        ) : null}
      </div>
    );
  }
}
