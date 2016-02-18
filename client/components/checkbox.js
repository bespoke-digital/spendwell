
import { Component, PropTypes } from 'react';

import style from 'sass/components/forms/input';


export default class Checkbox extends Component {
  static propTypes = {
    onChange: PropTypes.func.isRequired,
    checked: PropTypes.bool.isRequired,
    label: PropTypes.string.isRequired,
    errorMessage: PropTypes.string,
  };

  changeValue(event) {
    const { onChange } = this.props;
    onChange(event.currentTarget.checked);
  }

  render() {
    const { checked, errorMessage, label } = this.props;

    return (
      <div className={`
        mui-checkbox
        ${errorMessage ? 'error' : ''}
        ${style.root}
      `}>
        <label>
          <input
            type='checkbox'
            onChange={::this.changeValue}
            checked={checked}
          />
          {label}
        </label>
        {errorMessage ? <span>{errorMessage}</span> : null}
      </div>
    );
  }
}
