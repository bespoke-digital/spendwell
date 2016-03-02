
import _ from 'lodash';
import { Component, PropTypes } from 'react';

import Card from 'components/card';
import Button from 'components/button';
import TextInput from 'components/text-input';
import Dropdown from 'components/dropdown';

import style from 'sass/components/filter';


const FIELDS = {
  description: { label: 'Description', type: 'string' },
  category: { label: 'Category', type: 'string' },
  amountGt: { label: 'Amount Greater Than', type: 'number' },
  amountLt: { label: 'Amount Less Than', type: 'number' },
  dateGt: { label: 'Date Greater Than', type: 'date' },
  dateLt: { label: 'Date Less Than', type: 'date' },
  accountId: { label: 'Account', type: 'account' },
};


class Filter extends Component {
  static propTypes = {
    filter: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired,
  };

  updateField(field, value) {
    const filter = _.cloneDeep(this.props.filter);

    filter[field] = this.toData(field, value);

    this.props.onChange(filter);
  }

  replaceField(oldField, newField, event) {
    if (event) event.preventDefault();

    const filter = _.cloneDeep(this.props.filter);

    filter[newField] = filter[oldField];
    delete filter[oldField];

    this.props.onChange(filter);
  }

  removeField(field) {
    const filter = _.cloneDeep(this.props.filter);

    delete filter[field];

    this.props.onChange(filter);
  }

  addField(field, event) {
    if (event) event.preventDefault();

    if (!this.props.filter[field]) {
      const filter = _.cloneDeep(this.props.filter);

      filter[field] = null;

      this.props.onChange(filter);
    }
  }

  toInput(field, value) {
    if (FIELDS[field].type === 'number' && _.isNumber(value))
      value = (value / 100).toString();
    return value;
  }

  toData(field, value) {
    if (FIELDS[field].type === 'number' && _.isNumber(value))
      value = parseInt(parseFloat(value) * 100);
    return value;
  }

  renderDropdown(usedFields, selected) {
    const fields = _.filter(
      Object.keys(FIELDS),
      (field)=> usedFields.indexOf(field) === -1 || field === selected
    );

    if (fields.length === 0)
      return null;

    const label = selected ? FIELDS[selected].label : 'Field';

    return (
      <Dropdown label={label}>
        {fields.map((field)=>
          <a
            href='#'
            key={FIELDS[field].label}
            onClick={selected ?
              this.replaceField.bind(this, selected, field)
            :
              this.addField.bind(this, field)
            }
          >
            {FIELDS[field].label}
          </a>
        )}
      </Dropdown>
    );
  }

  render() {
    const { filter } = this.props;
    const fields = Object.keys(filter);

    return (
      <Card className={style.root}>
        {fields.map((field)=>
          <div key={field} className='field'>
            {this.renderDropdown(fields, field)}

            <TextInput
              value={this.toInput(field, filter[field])}
              onChange={this.updateField.bind(this, field)}
            />

            <Button onClick={()=> this.removeField(field)}>
              Remove Field
            </Button>
          </div>
        )}

        {this.renderDropdown(fields)}
      </Card>
    );
  }
}

export default Filter;
