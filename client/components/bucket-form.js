
import _ from 'lodash';
import Relay from 'react-relay';
import { Component, PropTypes } from 'react';

import Card from 'components/card';
import CardList from 'components/card-list';
import TextInput from 'components/text-input';
import Filters from 'components/filters';
import TransactionList from 'components/transaction-list';
import ListHeading from 'components/list-heading';

import style from 'sass/components/bucket-form';


function cleanFilter(filter) {
  return _.pick(filter, (v, k)=> !(_.isNull(v) || k === '__dataID__' || v === ''));
}

function cleanFilters(filters) {
  return filters.map(cleanFilter).filter((filter)=> _.some(_.values(filter)));
}

function getInitialState({ bucket, initialFilters, initialName }) {
  return {
    filters: bucket ? cleanFilters(bucket.filters) : (initialFilters || []),
    name: bucket ? bucket.name : (initialName || ''),
  };
}

class BucketForm extends Component {
  static propTypes = {
    loading: PropTypes.bool,
    initialName: PropTypes.string,
    initialFilters: PropTypes.arrayOf(PropTypes.object),
  };

  static defaultProps = {
    type: 'expense',
  };

  constructor(props) {
    super();
    this.state = getInitialState(props);
  }

  componentWillMount() {
    const { filters } = this.state;
    this.props.relay.setVariables({ filters: cleanFilters(filters) });
  }

  getData() {
    const { filters, name } = this.state;
    return { name, filters: cleanFilters(filters) };
  }

  reset() {
    this.setState(getInitialState(this.props));
  }

  isValid() {
    const { filters, name } = this.state;
    return filters.length > 0 & name.length > 0;
  }

  handleAddFilter() {
    const filters = _.clone(this.state.filters);

    filters.push({ descriptionContains: '' });

    this.setState({ filters });
  }

  handleRemoveFilter(index) {
    const filters = _.clone(this.state.filters);

    filters.splice(index, 1);

    this.setState({ filters });
    this.props.relay.setVariables({ filters: cleanFilters(filters) });
  }

  handleChangeFilter(index, filter) {
    const filters = _.clone(this.state.filters);

    filters[index] = filter;

    this.setState({ filters });
    this.props.relay.setVariables({ filters: cleanFilters(filters) });
  }

  handleChangeName(name) {
    this.setState({ name });
  }

  handleLoad() {
    const { count } = this.props.relay.variables;
    this.props.relay.setVariables({ count: count + 50 });
  }

  render() {
    const { viewer } = this.props;
    const { name, filters } = this.state;

    return (
      <div className={style.root}>
        <CardList>
          <Card>
            <TextInput
              label='Name'
              value={name}
              onChange={::this.handleChangeName}
            />
          </Card>

          <Filters
            filters={filters}
            viewer={viewer}
            onAdd={::this.handleAddFilter}
            onRemove={::this.handleRemoveFilter}
            onChange={::this.handleChangeFilter}
          />
        </CardList>

        <ListHeading>Filtered Transactions</ListHeading>

        <CardList>
          <TransactionList
            viewer={viewer}
            transactions={viewer.transactions}
            months={true}
            onLoadMore={::this.handleLoad}
          />
        </CardList>

      </div>
    );
  }
}

BucketForm = Relay.createContainer(BucketForm, {
  initialVariables: {
    filters: [],
    count: 50,
  },
  fragments: {
    viewer: ()=> Relay.QL`
      fragment on Viewer {
        ${Filters.getFragment('viewer')}
        ${TransactionList.getFragment('viewer')}

        transactions(first: $count, filters: $filters, isTransfer: false) {
          ${TransactionList.getFragment('transactions')}
        }
      }
    `,
    bucket: ()=> Relay.QL`
      fragment on BucketNode {
        name
        type

        filters {
          amountGt
          amountLt
          dateGte
          dateLte
          descriptionContains
          descriptionExact
        }
      }
    `,
  },
});

export default BucketForm;
