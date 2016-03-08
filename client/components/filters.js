
import _ from 'lodash';
import { Component, PropTypes } from 'react';

import SuperCard from 'components/super-card';
import Card from 'components/card';
import Button from 'components/button';
import Filter from 'components/filter';
import FIELDS from 'constants/filter-fields';


class Filters extends Component {
  static propTypes = {
    filters: PropTypes.array.isRequired,
    onChange: PropTypes.func.isRequired,
  };

  constructor() {
    super();
    this.state = { selectedFilter: null };
  }

  updateFilter(index, filter) {
    const filters = _.cloneDeep(this.props.filters);

    filters[index] = filter;

    this.props.onChange(filters);
  }

  addFilter() {
    const filters = _.cloneDeep(this.props.filters);

    filters.push({});
    this.setState({ selectedFilter: filters.length - 1 });

    this.props.onChange(filters);
  }

  removeFilter(index) {
    const filters = _.cloneDeep(this.props.filters);

    filters.splice(index, 1);
    if (filters.length === 0)
      filters.push({});

    this.props.onChange(filters);
  }

  selectFilter(index) {
    const { selectedFilter } = this.state;

    if (selectedFilter === index) index = null;

    this.setState({ selectedFilter: index });
  }

  render() {
    const { filters } = this.props;
    const { selectedFilter } = this.state;

    const canAddFilter = _.some(_.map(filters, (f)=> _.some(_.values(f).map((v)=> !!v))));

    return (
      <div>
        {filters.map((filter, index)=> (
          <SuperCard
            key={index}
            expanded={selectedFilter === index}
            onSummaryClick={this.selectFilter.bind(this, index)}
            summary={
              <Card summary={
                <div>
                  <div>
                    {_.map(filter, (value, key)=> `${FIELDS[key].label}: ${value}`).join(', ')}
                  </div>
                  <Button onClick={this.removeFilter.bind(this, index)}>Remove</Button>
                </div>
              }/>
            }
          >
            <Filter filter={filter} onChange={this.updateFilter.bind(this, index)}/>
          </SuperCard>
        ))}

        <Card>
          <Button
            onClick={::this.addFilter}
            disabled={!canAddFilter}
          >
            add filter
          </Button>
        </Card>
      </div>
    );
  }
}

export default Filters;
