
import _ from 'lodash';
import { Component, PropTypes } from 'react';

import Dropdown from 'components/dropdown';


export default class Select extends Component {
  static propTypes = {
    value: PropTypes.any,
    onChange: PropTypes.func.isRequired,
    options: PropTypes.arrayOf(
      PropTypes.shape({ label: PropTypes.string, value: PropTypes.any })
    ).isRequired,
    label: PropTypes.string.isRequired,
    variant: PropTypes.oneOf(['primary', 'danger', 'accent']),
    className: PropTypes.string,
  };

  static defaultProps = {
    className: '',
  };

  handleOptionClick(option, event) {
    event.preventDefault();
    this.props.onChange(option.value);
  }

  render() {
    const { value, label, options, variant, className } = this.props;

    const valueLabel = _.result(_.find(options, { value }), 'label');

    return (
      <span className={className}>
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
      </span>
    );
  }
}
