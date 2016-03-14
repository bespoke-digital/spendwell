
import { Component, PropTypes } from 'react';

import TextInput from 'components/text-input';


export default class MoneyInput extends Component {
  static propTypes = {
    onChange: PropTypes.func.isRequired,
    value: PropTypes.number,
  };

  constructor() {
    super();
    this.state = { addDecimal: false };
  }

  onChange(value) {
    this.setState({ addDecimal: value[value.length - 1] === '.' });

    value = parseInt(parseFloat(value) * 100);

    if (this.props.onChange)
      this.props.onChange(value);
  }

  render() {
    const { onChange, value, ..._props } = this.props;
    const { addDecimal } = this.state;

    let _value = value || 0;
    _value /= 100;
    _value = _value.toString();

    if (addDecimal)
      _value += '.';

    return (
      <TextInput
        onChange={::this.onChange}
        value={_value}
        {..._props}
      />
    );
  }
}
