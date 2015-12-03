
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
        mui-textfield
        mui-textfield--float-label
        ${this.showError() ? 'mui-textfield--invalid' : ''}
        ${style.root}
      `}>
        <input
          type='text'
          onChange={this.changeValue}
          value={value}
          className={value ? 'mui--is-not-empty' : ''}
        />
        {this.props.label ? <label>{this.props.label}</label> : null}
        {errorMessage ? <span>{errorMessage}</span> : null}
      </div>
    );
  },
});
