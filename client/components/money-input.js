
import _ from 'lodash';
import { Component, PropTypes } from 'react';

import TextInput from 'components/text-input';


export default class MoneyInput extends Component {
  static propTypes = {
    onChange: PropTypes.func.isRequired,
    initialValue: PropTypes.number,
  };

  constructor() {
    super();
    this.state = { addDecimal: false };
  }

  onChange(value) {
    this.setState({ value });

    value = parseInt(parseFloat(value) * 100);

    if (!_.isNaN(value) && this.props.onChange)
      this.props.onChange(value);
  }

  render() {
    const { onChange, initialValue, ..._props } = this.props;
    const { value } = this.state;

    return (
      <TextInput
        onChange={::this.onChange}
        value={_.isUndefined(value) ? (initialValue / 100).toString() : value}
        error={!_.isUndefined(value) && _.isNaN(parseFloat(value))}
        {..._props}
      />
    );
  }
}
