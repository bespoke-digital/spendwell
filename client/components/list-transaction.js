
import { Component, PropTypes } from 'react';
import Relay from 'react-relay';

import Card from 'components/card';
import Money from 'components/money';
import Button from 'components/button';
import DateTime from 'components/date-time';

import { MarkTransactionAsFromSavings } from 'mutations/transactions';

import styles from 'sass/components/list-transaction';


class ListTransaction extends Component {
  static propTypes = {
    expanded: PropTypes.bool,
    onClick: PropTypes.func,
    abs: PropTypes.bool,
  };

  static defaultProps = {
    expanded: false,
  };

  markAsFromSavings() {
    const { transaction } = this.props;

    Relay.Store.commitUpdate(new MarkTransactionAsFromSavings({ transaction }), {
      onSuccess: ()=> console.log('MarkTransactionAsFromSavings Success'),
      onFailure: ()=> console.log('MarkTransactionAsFromSavings Failure'),
    });
  }

  render() {
    const { transaction, expanded, onClick, abs } = this.props;

    return (
      <Card
        className={`transaction ${styles.root}`}
        expanded={expanded}
        onSummaryClick={onClick}
        summary={
          <div>
            <div className='name'>
              {transaction.description}
            </div>
            {/*<div className='category'>
              {transaction.category ? transaction.category.name : null}
            </div>*/}
            <div className='buckets'>
              {transaction.buckets.edges.map(({ node })=>
                <span key={node.id}>{node.name}</span>
              )}
            </div>
            <div className='date'>
              <DateTime value={transaction.date} format='Do'/>
            </div>
            <div className='amount'>
              <Money amount={transaction.amount} abs={abs}/>
            </div>
          </div>
        }
      >
        <ul className='list-unstyled'>
          <li>
            <strong>{'ID: '}</strong>
            {transaction.djid}
          </li>
          <li>
            <strong>{'Date: '}</strong>
            <DateTime value={transaction.date}/>
          </li>
          <li>
            <strong>{'Amount: '}</strong>
            <Money amount={transaction.amount}/>
          </li>
          <li>
            <strong>{'Account: '}</strong>
            {transaction.account.name}
            {` (${transaction.account.id})`}
          </li>
          <li>
            <strong>{'Institution: '}</strong>
            {transaction.account.institution.name}
            {` (${transaction.account.institution.id})`}
          </li>
          {transaction.buckets.edges.length ?
            <li>
              <strong>{'Buckets: '}</strong>
              <div className='buckets'>
                {transaction.buckets.edges.map(({ node })=>
                  <span key={node.id}>{node.name}</span>
                )}
              </div>
            </li>
          : null}
          {transaction.transferPair ?
            <li>
              <strong>{'Transfer Pair: '}</strong>
              {transaction.transferPair.description}
              {' - '}
              <Money amount={transaction.transferPair.amount}/>
            </li>
          : null}
        </ul>

        <Button onClick={::this.markAsFromSavings} variant='primary'>
          Mark As Spend From Savings
        </Button>
      </Card>
    );
  }
}

ListTransaction = Relay.createContainer(ListTransaction, {
  fragments: {
    transaction: ()=> Relay.QL`
      fragment on TransactionNode {
        ${MarkTransactionAsFromSavings.getFragment('transaction')}
        id
        djid
        description
        amount
        date
        transferPair {
          description
          amount
        }
        category { name }
        account {
          id
          name
          institution {
            id
            name
          }
        }
        buckets(first: 100) {
          edges {
            node {
              id
              name
            }
          }
        }
      }
    `,
  },
});

export default ListTransaction;
