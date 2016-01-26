
import { createClass, PropTypes } from 'react';
import Formsy from 'formsy-react';

import style from 'sass/components/forms/input';


export default createClass({
  mixins: [Formsy.Mixin],

  propTypes: {
    onChange: PropTypes.func,
    className: PropTypes.string,
  },

  defaultProps: {
    className: '',
  },

  changeValue(event) {
    this.setValue(event.currentTarget.value);
    if (this.props.onChange)
      this.props.onChange(event.currentTarget.value);
  },

  render() {
    const { type, label, className } = this.props;
    const errorMessage = this.getErrorMessage();
    const value = this.getValue();

    return (
      <div className={`
        mui-textfield
        mui-textfield--float-label
        ${this.showError() ? 'mui-textfield--invalid' : ''}
        ${style.root}
        ${className}
      `}>
        <input
          type={type || 'text'}
          onChange={this.changeValue}
          value={value}
          className={value ? 'mui--is-not-empty' : ''}
        />
        {label ? <label>{label}</label> : null}
        {errorMessage ? (
          <span className='mui-textfield__help-text'>{errorMessage}</span>
        ) : null}
      </div>
    );
  },
});
