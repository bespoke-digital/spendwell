
import _ from 'lodash';
import { Component } from 'react';
import Relay from 'react-relay';

import Card from 'components/card';
import CardList from 'components/card-list';
import TransactionList from 'components/transaction-list';
import ScrollTrigger from 'components/scroll-trigger';
import Checkbox from 'components/checkbox';
import Select from 'components/select';
import TextInput from 'components/text-input';
import App from 'components/app';

import styles from 'sass/views/bucket.scss';


class Transactions extends Component {
  constructor() {
    super();
    this.handleSearchChange = _.debounce(::this.handleSearchChange, 300);
  }

  handleScroll() {
    this.props.relay.setVariables({ count: this.props.relay.variables.count + 50 });
  }

  handleOutgoingChange(checked) {
    this.props.relay.setVariables({
      amountGt: checked ? null : 0,
    });
  }

  handleIncomingChange(checked) {
    this.props.relay.setVariables({
      amountLt: checked ? null : 0,
    });
  }

  handleFromSavingsChange(fromSavings) {
    this.props.relay.setVariables({ fromSavings });
  }

  handleTransfersChange(isTransfer) {
    this.props.relay.setVariables({ isTransfer });
  }

  handleSearchChange(value) {
    this.props.relay.setVariables({
      description: value ? value : null,
    });
  }

  render() {
    const { viewer } = this.props;
    const { amountGt, amountLt, fromSavings, isTransfer, description } = this.props.relay.variables;
    return (
      <App viewer={viewer}>
        <ScrollTrigger
          className={`container ${styles.root}`}
          onTrigger={::this.handleScroll}
        >
          <div className='heading'>
            <h1>Transactions</h1>
          </div>

          <CardList>
            <Card className='card-list-headings'>Filters</Card>
            <Card>
              <Checkbox
                label='Outgoing'
                checked={amountGt === null}
                onChange={::this.handleOutgoingChange}
              />
            </Card>
            <Card>
              <Checkbox
                label='Incoming'
                checked={amountLt === null}
                onChange={::this.handleIncomingChange}
              />
            </Card>
            <Card>
              <Select
                label='From Savings'
                onChange={::this.handleFromSavingsChange}
                value={fromSavings}
                options={[
                  { value: null, label: 'All' },
                  { value: true, label: 'Only' },
                  { value: false, label: 'None' },
                ]}
              />
            </Card>
            <Card>
              <Select
                label='Transfers'
                onChange={::this.handleTransfersChange}
                value={isTransfer}
                options={[
                  { value: null, label: 'All' },
                  { value: true, label: 'Only' },
                  { value: false, label: 'None' },
                ]}
              />
            </Card>
            <Card>
              <TextInput
                label='Search'
                onChange={this.handleSearchChange}
                value={description || ''}
              />
            </Card>
          </CardList>

          <TransactionList transactions={viewer.transactions} abs={false}/>
        </ScrollTrigger>
      </App>
    );
  }
}

Transactions = Relay.createContainer(Transactions, {
  initialVariables: {
    count: 50,
    amountGt: null,
    amountLt: null,
    fromSavings: null,
    isTransfer: null,
    description: null,
  },
  fragments: {
    viewer: ()=> Relay.QL`
      fragment on Viewer {
        ${App.getFragment('viewer')}
        transactions(
          first: $count,
          amountGt: $amountGt,
          amountLt: $amountLt,
          fromSavings: $fromSavings,
          isTransfer: $isTransfer,
          description: $description,
        ) {
          ${TransactionList.getFragment('transactions')}
        }
      }
    `,
  },
});

export default Transactions;
