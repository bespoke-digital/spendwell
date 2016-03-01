
import _ from 'lodash';
import { Component, PropTypes } from 'react';

import SuperCard from 'components/super-card';
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
      <SuperCard expanded summary={
        <Card><h3>Filters</h3></Card>
      }>
        {value.map((filter, index)=>
          <Filter
            key={index}
            value={filter}
            onChange={(filter)=> this.updateFilter(index, filter)}
            onRemove={()=> this.removeFilter(index)}
          />
        )}

        <div className='bottom-buttons'>
          <Button
            onClick={::this.addFilter}
            disabled={_.isEmpty(value[value.length - 1])}
            flat
            variant='primary'
          >
            new filter
          </Button>
        </div>
      </SuperCard>
    );
  }
}
