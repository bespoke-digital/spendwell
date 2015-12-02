
import { createClass } from 'react';
import Formsy from 'formsy-react';

import style from 'sass/components/forms/input';


export default createClass({
  mixins: [Formsy.Mixin],

  changeValue(event) {
    this.setValue(event.currentTarget.value);
  },

  render() {
    const errorMessage = this.getErrorMessage();
    const value = this.getValue();

    return (
      <div className={`
        mui-checkbox
        ${this.showError() ? 'error' : ''}
        ${style.root}
      `}>
        <label>
          <input
            type='checkbox'
            onChange={this.changeValue}
            value={value}
            className={value ? 'mui--is-not-empty' : ''}
          />
          {this.props.label}
        </label>
        {errorMessage ? <span>{errorMessage}</span> : null}
      </div>
    );
  },
});
