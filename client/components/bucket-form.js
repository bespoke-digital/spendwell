
import Relay from 'react-relay';
import { Component, PropTypes } from 'react';
import { browserHistory } from 'react-router';

import Button from 'components/button';
import Card from 'components/card';
import TextInput from 'components/text-input';
import Filters from 'components/filters';
import TransactionList from 'components/transaction-list';
import ScrollTrigger from 'components/scroll-trigger';


class BucketForm extends Component {
  static propTypes = {
    onSubmit: PropTypes.func.isRequired,
  };

  constructor() {
    super();
    this.state = { filters: [{}], name: '' };
  }

  componentWillMount() {
    if (this.props.bucket)
      this.setState({
        filters: this.props.bucket.filters,
        name: this.props.bucket.name,
      });
  }

  handleSubmit() {
    const { onSubmit } = this.props;
    const { filters, name } = this.state;

    onSubmit({ name, filters });
  }

  handleFilterChange(filters) {
    this.props.relay.setVariables({ filters });
    this.setState({ filters });
  }

  handleScroll() {
    this.props.relay.setVariables({ count: this.props.relay.variables.count + 50 });
  }

  render() {
    const { viewer: { transactions }, bucket } = this.props;
    const { name, filters } = this.state;

    const valid = name.length && filters.length;

    return (
      <ScrollTrigger onTrigger={::this.handleScroll}>
        <Card>
          <TextInput label='Name' value={name} onChange={(name)=> this.setState({ name })}/>
        </Card>

        <Card>
          <h3>Filters</h3>
        </Card>

        <Filters value={filters} onChange={::this.handleFilterChange}/>

        <Card>
          <Button
            variant='primary'
            disabled={!valid}
            onClick={::this.handleSubmit}
          >
            {bucket ? 'Create' : 'Save'}
          </Button>
          <Button onClick={()=> browserHistory.goBack()}>Cancel</Button>
        </Card>

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
          description
          fromSavings
          isTransfer
        }
      }
    `,
  },
});

export default BucketForm;
