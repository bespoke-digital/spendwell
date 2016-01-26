
import { Component } from 'react';
import Formsy from 'formsy-react';
import reactMixin from 'react-mixin';

import style from 'sass/components/forms/input';


@reactMixin.decorate(Formsy.Mixin)
export default class Checkbox extends Component {
  changeValue(event) {
    this.setValue(event.currentTarget.checked);
  }

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
            onChange={::this.changeValue}
            checked={this.getValue()}
          />
          {this.props.label}
        </label>
        {errorMessage ? <span>{errorMessage}</span> : null}
      </div>
    );
  }
}
