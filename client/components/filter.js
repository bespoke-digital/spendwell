
import _ from 'lodash';
import { Component, PropTypes } from 'react';

import Button from 'components/button';
import TextInput from 'components/text-input';
import Dropdown from 'components/dropdown';


export default class Filter extends Component {
  static propTypes = {
    value: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired,
  };

  set(fields) {
    this.props.onChange(
      _.defaultsDeep(fields, this.props.value),
    );
  }

  replaceField(oldField, newField) {
    const value = _.cloneDeep(this.props.value);

    if (oldField === null)
      this.setState({ addNew: false });
    else
      delete value[oldField];

    value[newField] = null;

    this.props.onChange(value);
  }

  removeField(field) {
    const value = _.cloneDeep(this.props.value);

    delete value[field];

    this.props.onChange(value);
  }

  addField(field, event) {
    if (event) event.preventDefault();

    if (!this.props.value[field]) {
      const value = _.cloneDeep(this.props.value);

      value[field] = null;

      this.props.onChange(value);
    }
  }

  render() {
    const { value } = this.props;

    const fields = Object.keys(value);

    const fieldOptions = _.filter([
      { label: 'Description', value: 'description' },
    ], ({ value })=> fields.indexOf(value) === -1);

    return (
      <div>
        {fields.map((field)=>
          <div key={field}>
            <Button onClick={()=> this.removeField(field)}>
              <i className='fa fa-times'/>{' Remove Field'}
            </Button>

            {field === 'description' ?
              <TextInput
                label='Description'
                value={value[field]}
                onChange={(fieldValue)=> this.set({ [field]: fieldValue })}
              />
            : null}
          </div>
        )}

        <Dropdown disabled={fieldOptions.length === 0} label={
          <span><i className='fa fa-plus'/>{' Field'}</span>
        }>
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
      </div>
    );
  }
}
