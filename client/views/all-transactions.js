
import { Component } from 'react';
import Relay from 'react-relay';

import Card from 'components/card';
import CardList from 'components/card-list';
import Button from 'components/button';
import TransactionList from 'components/transaction-list';
import ScrollTrigger from 'components/scroll-trigger';

import styles from 'sass/views/bucket.scss';


class AllTransactions extends Component {
  handleScroll() {
    this.props.relay.setVariables({ count: this.props.relay.variables.count + 50 });
  }

  render() {
    const { viewer } = this.props;
    return (
      <ScrollTrigger
        className={`container ${styles.root}`}
        onTrigger={::this.handleScroll}
      >
        <div className='heading'>
          <Button to='/app/' className='back'>
            <i className='fa fa-long-arrow-left'/>
          </Button>

          <h1>All Transactions</h1>
        </div>

        <TransactionList transactions={viewer.transactions}/>
      </ScrollTrigger>
    );
  }
}

AllTransactions = Relay.createContainer(AllTransactions, {
  initialVariables: {
    count: 50,
    amountGt: null,
    amountLt: null,
    fromSavings: true,
  },
  fragments: {
    viewer: ()=> Relay.QL`
      fragment on Viewer {
        transactions(first: $count) {
          ${TransactionList.getFragment('transactions')}
        }
      }
    `,
  },
});

export default AllTransactions;
