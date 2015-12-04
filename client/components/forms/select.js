
import _ from 'lodash';
import { createClass, PropTypes } from 'react';
import Formsy from 'formsy-react';

import Dropdown from 'components/dropdown';


export default createClass({
  mixins: [Formsy.Mixin],

  propTypes: {
    label: PropTypes.string.isRequired,
    options: PropTypes.arrayOf(
      PropTypes.shape({ value: PropTypes.any, label: PropTypes.string })
    ).isRequired,
    variant: PropTypes.oneOf(['primary', 'danger', 'accent']),
    onChange: PropTypes.func,
  },

  handleOptionClick(option, event) {
    event.preventDefault();

    this.setValue(option.value);

    if (this.props.onChange)
      this.props.onChange(option.value);
  },

  render() {
    const { label, options, variant } = this.props;

    const value = this.getValue();
    const valueLabel = _.result(_.find(options, { value }), 'label');

    return (
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
    );
  },
});
