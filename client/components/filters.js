
import _ from 'lodash';
import { Component, PropTypes } from 'react';

import Card from 'components/card';
import Button from 'components/button';
import Filter from 'components/filter';


export default class Filters extends Component {
  static propTypes = {
    value: PropTypes.array.isRequired,
    onChange: PropTypes.func.isRequired,
  };

  updateFilter(index, filter) {
    const value = _.cloneDeep(this.props.value);

    value[index] = filter;

    this.props.onChange(value);
  }

  addFilter() {
    const value = _.cloneDeep(this.props.value);

    value.push({});

    this.props.onChange(value);
  }

  removeFilter(index) {
    const value = _.cloneDeep(this.props.value);

    value.splice(index, 1);
    if (value.length === 0)
      value.push({});

    this.props.onChange(value);
  }

  render() {
    const { value } = this.props;

    return (
      <span>
        {value.map((filter, index)=>
          <Card key={index}>
            <Button
              onClick={()=> this.removeFilter(index)}
              disabled={value.length === 1}
            >
              <i className='fa fa-times'/>{' Remove Filter'}
            </Button>

            <Filter
              value={filter}
              onChange={(filter)=> this.updateFilter(index, filter)}
            />
          </Card>
        )}
        <Card>
          <Button onClick={::this.addFilter} disabled={_.isEmpty(value[value.length - 1])}>
            <i className='fa fa-plus'/>{' OR'}
          </Button>
        </Card>
      </span>
    );
  }
}
