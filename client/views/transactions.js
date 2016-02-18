
import { Component } from 'react';
import Relay from 'react-relay';

import Card from 'components/card';
import CardList from 'components/card-list';
import Button from 'components/button';
import TransactionList from 'components/transaction-list';
import ScrollTrigger from 'components/scroll-trigger';
import Checkbox from 'components/checkbox';
import Select from 'components/select';

import styles from 'sass/views/bucket.scss';


class Transactions extends Component {
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

  render() {
    const { viewer } = this.props;
    const { amountGt, amountLt, fromSavings, isTransfer } = this.props.relay.variables;
    return (
      <ScrollTrigger
        className={`container ${styles.root}`}
        onTrigger={::this.handleScroll}
      >
        <div className='heading'>
          <Button to='/app/' className='back'>
            <i className='fa fa-long-arrow-left'/>
          </Button>

          <h1>Transactions</h1>
        </div>

        <CardList>
          <Card>
            <Checkbox
              label='Outgoing'
              checked={amountGt === null}
              onChange={::this.handleOutgoingChange}
            />
            <Checkbox
              label='Incoming'
              checked={amountLt === null}
              onChange={::this.handleIncomingChange}
            />
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
        </CardList>

        <TransactionList transactions={viewer.transactions} abs={false}/>
      </ScrollTrigger>
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
  },
  fragments: {
    viewer: ()=> Relay.QL`
      fragment on Viewer {
        transactions(
          first: $count,
          amountGt: $amountGt,
          amountLt: $amountLt,
          fromSavings: $fromSavings,
          isTransfer: $isTransfer,
        ) {
          ${TransactionList.getFragment('transactions')}
        }
      }
    `,
  },
});

export default Transactions;
