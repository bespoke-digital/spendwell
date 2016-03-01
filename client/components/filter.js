
import _ from 'lodash';
import { Component, PropTypes } from 'react';
import Relay from 'react-relay';

import Card from 'components/card';
import Button from 'components/button';
import TextInput from 'components/text-input';
import Dropdown from 'components/dropdown';

import style from 'sass/components/filter';


class Filter extends Component {
  static propTypes = {
    filter: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired,
  };

  set(fields) {
    this.props.onChange(
      _.defaultsDeep(fields, this.props.filter),
    );
  }

  replaceField(oldField, newField) {
    const filter = _.cloneDeep(this.props.filter);

    if (oldField === null)
      this.setState({ addNew: false });
    else
      delete filter[oldField];

    filter[newField] = null;

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

  renderDropdown(usedFields, selected) {
    const fieldOptions = _.filter([
      { label: 'Description', value: 'description' },
      { label: 'Category', value: 'category' },
      { label: 'Amount Greater Than', value: 'amountGt' },
      { label: 'Amount Less Than', value: 'amountLt' },
      { label: 'Date Greater Than', value: 'dateGt' },
      { label: 'Date Less Than', value: 'dateLt' },
      { label: 'Account', value: 'accountId' },
    ], ({ value })=> usedFields.indexOf(value) === -1 || value === selected);

    const selectedOption = selected ? _.find(fieldOptions, (o)=> o.value === selected) : null;
    const label = selectedOption ? selectedOption.label : 'Field';

    return (
      <Dropdown disabled={fieldOptions.length === 0} label={label}>
        {fieldOptions.map(({ value, label })=>
          <a
            href='#'
            key={label}
            onClick={this.addField.bind(this, value)}
          >
            {label}
          </a>
        )}
      </Dropdown>
    );
  }

  render() {
    const { filter } = this.props;

    const fields = Object.keys(filter).filter((k)=> filter[k] !== null && k.indexOf('__') !== 0);
    console.log('fields', fields);

    return (
      <Card className={style.root}>
        {fields.map((field)=>
          <div key={field} className='field'>
            {this.renderDropdown(fields, field)}

            {field === 'description' ?
              <TextInput
                value={filter[field]}
                onChange={(fieldValue)=> this.set({ [field]: fieldValue })}
              />
            : null}

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

Filter = Relay.createContainer(Filter, {
  fragments: {
    filter: ()=> Relay.QL`
      fragment on BucketFilters {
        amountGt
        amountLt
        category
        dateGte
        dateLte
        description
        fromSavings
        isTransfer
      }
    `,
  },
});

export default Filter;
