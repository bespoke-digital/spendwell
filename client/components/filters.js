
import _ from 'lodash';
import { Component, PropTypes } from 'react';
import Relay from 'react-relay';

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

    filters.push({ descriptionContains: '' });
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

  filterName(filter) {
    const fields = _.filter(_.keys(filter), (key)=> filter[key]);
    if (fields.length === 0)
      return 'New Filter';
    else
      return _.map(fields, (key)=> `${FIELDS[key].label}: ${filter[key]}`).join(', ');
  }

  render() {
    const { filters, viewer } = this.props;
    const { selectedFilter } = this.state;

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
                    {this.filterName(filter)}
                  </div>
                  <Button
                    onClick={this.removeFilter.bind(this, index)}
                    disabled={filters.length === 1}
                  >Remove</Button>
                </div>
              }/>
            }
          >
            <Filter
              viewer={viewer}
              filter={filter}
              onChange={this.updateFilter.bind(this, index)}
              onCollapse={this.selectFilter.bind(this, null)}
            />
          </SuperCard>
        ))}

        <Card>
          <Button onClick={::this.addFilter}>
            add filter
          </Button>
        </Card>
      </div>
    );
  }
}

Filters = Relay.createContainer(Filters, {
  fragments: {
    viewer: ()=> Relay.QL`
      fragment on Viewer {
        ${Filter.getFragment('viewer')}
      }
    `,
  },
});

export default Filters;
