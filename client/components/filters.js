
import _ from 'lodash';
import { Component, PropTypes } from 'react';
import Relay from 'react-relay';

import SuperCard from 'components/super-card';
import Card from 'components/card';
import Button from 'components/button';
import Filter from 'components/filter';


class Filters extends Component {
  static propTypes = {
    filters: PropTypes.array.isRequired,
    onChange: PropTypes.func.isRequired,
  };

  updateFilter(index, filter) {
    const filters = _.cloneDeep(this.props.filters);

    filters[index] = filter;

    this.props.onChange(filters);
  }

  addFilter() {
    const filters = _.cloneDeep(this.props.filters);

    filters.push({});

    this.props.onChange(filters);
  }

  removeFilter(index) {
    const filters = _.cloneDeep(this.props.filters);

    filters.splice(index, 1);
    if (filters.length === 0)
      filters.push({});

    this.props.onChange(filters);
  }

  render() {
    const { filters } = this.props;

    return (
      <SuperCard expanded summary={
        <Card><h3>Filters</h3></Card>
      }>
        {filters.map((filter, index)=>
          <Filter
            key={index}
            filter={filter}
            onChange={(filter)=> this.updateFilter(index, filter)}
            onRemove={()=> this.removeFilter(index)}
          />
        )}

        <div className='bottom-buttons'>
          <Button
            onClick={::this.addFilter}
            disabled={_.isEmpty(filters[filters.length - 1])}
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

Filters = Relay.createContainer(Filters, {
  fragments: {
    filters: ()=> Relay.QL`
      fragment on BucketFilters @relay(plural: true) {
        ${Filter.getFragment('filter')}
      }
    `,
  },
});

export default Filters;
