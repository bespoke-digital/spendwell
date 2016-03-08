
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


class BucketForm extends Component {
  static propTypes = {
    onSubmit: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
    loading: PropTypes.bool,
  };

  constructor() {
    super();
    this.state = { filters: [{}], name: '' };
  }

  componentWillMount() {
    if (this.props.bucket) {
      const { name, filters } = this.props.bucket;

      const cleanFilters = filters.map(
        (f)=> _.pick(f, (v, k)=> !_.isNull(v) && k !== '__dataID__')
      );

      this.setState({ name, filters: cleanFilters });
    }
  }

  handleSubmit() {
    const { onSubmit } = this.props;
    const { filters, name } = this.state;

    onSubmit({ name, filters });
  }

  handleFilterChange(filters) {
    this.setState({ filters });
    this.props.relay.setVariables({ filters });
  }

  handleScroll() {
    this.props.relay.setVariables({ count: this.props.relay.variables.count + 50 });
  }

  render() {
    const { onCancel, viewer: { transactions }, bucket, loading } = this.props;
    const { name, filters } = this.state;

    const valid = name.length && filters.length;

    return (
      <ScrollTrigger onTrigger={::this.handleScroll}>
        <CardList>
          <Card>
            <TextInput
              label='Name'
              value={name}
              onChange={(name)=> this.setState({ name })}
              autoFocus={true}
            />
          </Card>

          <Filters filters={filters} onChange={::this.handleFilterChange}/>

          <Card>
            <Button
              variant='primary'
              disabled={!valid}
              onClick={::this.handleSubmit}
              loading={loading}
            >
              {bucket ? 'Create' : 'Save'}
            </Button>
            <Button onClick={onCancel}>Cancel</Button>
          </Card>
        </CardList>

        <TransactionList transactions={transactions}/>
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
        transactions(
          first: $count,
          filters: $filters,
          isTransfer: false,
          fromSavings: false,
        ) {
          ${TransactionList.getFragment('transactions')}
        }
      }
    `,
    bucket: ()=> Relay.QL`
      fragment on BucketNode {
        name
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
