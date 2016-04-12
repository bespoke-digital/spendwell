
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

import style from 'sass/components/bucket-form';


function cleanFilter(filter) {
  return _.pick(filter, (v, k)=> !(_.isNull(v) || k === '__dataID__' || v === ''));
}

function cleanFilters(filters) {
  return filters.map(cleanFilter).filter((filter)=> _.some(_.values(filter)));
}


class BucketForm extends Component {
  static propTypes = {
    onSubmit: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
    loading: PropTypes.bool,
    initialType: PropTypes.oneOf(['bill', 'expense', 'account']),
  };

  static defaultProps = {
    initialType: 'expense',
  };

  constructor({ initialType, bucket }) {
    super();

    this.state = {
      filters: bucket ? cleanFilters(bucket.filters) : [],
      name: bucket ? bucket.name : '',
      type: bucket ? bucket.type : initialType,
    };
  }

  componentWillMount() {
    const { filters } = this.state;
    this.props.relay.setVariables({ filters: cleanFilters(filters) });
  }

  handleSubmit() {
    const { onSubmit } = this.props;
    const { filters, name, type } = this.state;

    onSubmit({ type, name, filters: cleanFilters(filters) });
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

  handleScroll() {
    const { count } = this.props.relay.variables;
    this.props.relay.setVariables({ count: count + 50 });
  }

  render() {
    const { onCancel, viewer, bucket, loading } = this.props;
    const { name, filters, type } = this.state;

    const valid = name.length && filters.length;

    return (
      <ScrollTrigger onTrigger={::this.handleScroll} className={style.root}>
        <CardList>
          {type !== 'account' ?
            <Card className='bucket-type-selector'>
              <div
                className={`bucket-type ${type === 'bill' ? 'selected' : ''}`}
                onClick={()=> this.setState({ type: 'bill' })}
              >
                <h3>Bill</h3>
                <div>For monthly recurring expenses</div>
              </div>
              <div
                className={`bucket-type ${type === 'expense' ? 'selected' : ''}`}
                onClick={()=> this.setState({ type: 'expense' })}
              >
                <h3>Other Expense</h3>
                <div>For non-recurring expenses</div>
              </div>
            </Card>
          : null}

          <Card>
            <TextInput
              label='Name'
              value={name}
              onChange={(name)=> this.setState({ name })}
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

          <Card>
            <Button
              variant='primary'
              disabled={!valid}
              onClick={::this.handleSubmit}
              loading={loading}
            >
              {bucket ? 'Save Label' : 'Create Label'}
            </Button>
            <Button onClick={onCancel}>Cancel</Button>
          </Card>
        </CardList>

        <div className='heading'>
          <h2>All Transactions</h2>
        </div>

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
