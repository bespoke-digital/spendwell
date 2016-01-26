
import _ from 'lodash';
import { createClass, PropTypes } from 'react';
import Formsy from 'formsy-react';

import Dropdown from 'components/dropdown';

import style from 'sass/components/forms/select';


export default createClass({
  mixins: [Formsy.Mixin],

  propTypes: {
    label: PropTypes.string.isRequired,
    options: PropTypes.arrayOf(
      PropTypes.shape({ value: PropTypes.any, label: PropTypes.string })
    ).isRequired,
    variant: PropTypes.oneOf(['primary', 'danger', 'accent']),
    onChange: PropTypes.func,
    className: PropTypes.string,
  },

  defaultProps: {
    className: '',
  },

  handleOptionClick(option, event) {
    event.preventDefault();

    this.setValue(option.value);

    if (this.props.onChange)
      this.props.onChange(option.value);
  },

  render() {
    const { label, options, variant, className } = this.props;

    const value = this.getValue();
    const valueLabel = _.result(_.find(options, { value }), 'label');

    return (
      <div className={`${style.root} ${className}`}>
        <Dropdown
          label={valueLabel ? `${label}: ${valueLabel}` : label}
          variant={variant}
        >
          {options.map((option, index)=> (
            <a href='#' key={index} onClick={this.handleOptionClick.bind(this, option)}>
              {option.label}
            </a>
          ))}
        </Dropdown>
      </div>
    );
  },
});
