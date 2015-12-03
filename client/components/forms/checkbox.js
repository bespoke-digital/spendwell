
import { createClass } from 'react';
import Formsy from 'formsy-react';

import style from 'sass/components/forms/input';


export default createClass({
  mixins: [Formsy.Mixin],

  changeValue(event) {
    this.setValue(event.currentTarget.checked);
  },

  render() {
    const errorMessage = this.getErrorMessage();

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
            checked={this.getValue()}
          />
          {this.props.label}
        </label>
        {errorMessage ? <span>{errorMessage}</span> : null}
      </div>
    );
  },
});
