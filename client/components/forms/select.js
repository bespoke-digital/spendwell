
import _ from 'lodash';
import { createClass } from 'react';
import Formsy from 'formsy-react';

import Button from 'components/button';


export default createClass({
  mixins: [Formsy.Mixin],

  getInitialState() {
    return { open: false };
  },

  handleOptionClick(option, event) {
    event.preventDefault();

    this.setValue(option.value);
    this.setState({ open: false });
  },

  render() {
    const { label, options, varient } = this.props;
    const { open } = this.state;

    const errorMessage = this.getErrorMessage();
    const value = this.getValue();
    const valueLabel = _.result(_.find(options, { value }), 'label');

    return (
      <div className={`mui-dropdown`}>
        <Button onClick={this.setState.bind(this, { open: !open }, null)} varient={varient}>
          {valueLabel ? `${label}: ${valueLabel}` : label}
          <span className='mui-caret'/>
        </Button>
        <ul className={`mui-dropdown__menu ${open ? 'mui--is-open' : ''}`}>
          {options.map((option, index)=> (
            <li key={index}>
              <a href='#' onClick={this.handleOptionClick.bind(this, option)}>
                {option.label}
              </a>
            </li>
          ))}
        </ul>
        {errorMessage ? <span>{errorMessage}</span> : null}
      </div>
    );
  },
});
