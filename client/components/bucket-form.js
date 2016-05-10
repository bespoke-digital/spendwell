
import _ from 'lodash';
import Relay from 'react-relay';
import { Component, PropTypes } from 'react';

import Button from 'components/button';
import Card from 'components/card';
import CardList from 'components/card-list';
import TextInput from 'components/text-input';
import Filters from 'components/filters';
import TransactionList from 'components/transaction-list';
import ScrollTrigger from 'components/scroll-trigger';
import ListHeading from 'components/list-heading';

import style from 'sass/components/bucket-form';


function cleanFilter(filter) {
  return _.pick(filter, (v, k)=> !(_.isNull(v) || k === '__dataID__' || v === ''));
}

function cleanFilters(filters) {
  return filters.map(cleanFilter).filter((filter)=> _.some(_.values(filter)));
}


class BucketForm extends Component {
  static propTypes = {
    onChange: PropTypes.func.isRequired,
    loading: PropTypes.bool,
  };

  static defaultProps = {
    type: 'expense',
  };

  constructor({ bucket }) {
    super();

    this.state = {
      filters: bucket ? cleanFilters(bucket.filters) : [],
      name: bucket ? bucket.name : '',
    };
  }

  componentWillMount() {
    const { filters } = this.state;
    this.props.relay.setVariables({ filters: cleanFilters(filters) });
  }

  sendChange() {
    const { onChange } = this.props;
    const { filters, name } = this.state;

    onChange({ name, filters: cleanFilters(filters) });
  }

  handleAddFilter() {
    const filters = _.clone(this.state.filters);

    filters.push({ descriptionContains: '' });

    this.setState({ filters }, ::this.sendChange);
  }

  handleRemoveFilter(index) {
    const filters = _.clone(this.state.filters);

    filters.splice(index, 1);

    this.setState({ filters }, ::this.sendChange);
    this.props.relay.setVariables({ filters: cleanFilters(filters) });
  }

  handleChangeFilter(index, filter) {
    const filters = _.clone(this.state.filters);

    filters[index] = filter;

    this.setState({ filters }, ::this.sendChange);
    this.props.relay.setVariables({ filters: cleanFilters(filters) });
  }

  handleChangeName(name) {
    this.setState({ name }, ::this.sendChange);
  }

  handleScroll() {
    const { count } = this.props.relay.variables;
    this.props.relay.setVariables({ count: count + 50 });
  }

  render() {
    const { viewer } = this.props;
    const { name, filters } = this.state;

    return (
      <ScrollTrigger onTrigger={::this.handleScroll} className={style.root}>
        <CardList>
          <Card>
            <TextInput
              label='Name'
              value={name}
              onChange={::this.handleChangeName}
              autoFocus={true}
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
          />
        </CardList>

      </ScrollTrigger>
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
          category
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
