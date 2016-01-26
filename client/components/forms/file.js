
import { Component, PropTypes } from 'react';
import Formsy from 'formsy-react';
import reactMixin from 'react-mixin';

import style from 'sass/components/forms/input';


@reactMixin.decorate(Formsy.Mixin)
export default class FileInput extends Component {
  static propTypes = {
    onChange: PropTypes.func,
    label: PropTypes.string,
  };

  changeValue(event) {
    this.setValue(event.currentTarget.files);
    if (this.props.onChange)
      this.props.onChange(event.currentTarget.files);
  }

  render() {
    const { label } = this.props;
    const errorMessage = this.getErrorMessage();
    const value = this.getValue();

    return (
      <div className={`
        mui-textfield
        ${this.showError() ? 'mui-textfield--invalid' : ''}
        ${style.root}
      `}>
        <input
          type='file'
          onChange={::this.changeValue}
          className={value ? 'mui--is-not-empty' : ''}
        />
        {label ? <label>{label}</label> : null}
        {errorMessage ? (
          <span className='mui-textfield__help-text'>{errorMessage}</span>
        ) : null}
      </div>
    );
  }
}
