
import { Component, PropTypes } from 'react';

import style from 'sass/components/forms/input';


export default class Checkbox extends Component {
  static propTypes = {
    onChange: PropTypes.func.isRequired,
    checked: PropTypes.bool.isRequired,
    label: PropTypes.string.isRequired,
    errorMessage: PropTypes.string,
  };

  render() {
    const { checked, errorMessage, label, onChange } = this.props;

    return (
      <div className={`
        mui-checkbox
        ${errorMessage ? 'error' : ''}
        ${style.root}
      `}>
        <label onClick={onChange.bind(null, !checked)}>
          <i className={`fa fa-${checked ? 'check-' : ''}square-o`}/>
          {' '}
          {label}
        </label>
        {errorMessage ? <span>{errorMessage}</span> : null}
      </div>
    );
  }
}
