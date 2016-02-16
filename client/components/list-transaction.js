
import { Component, PropTypes } from 'react';
import moment from 'moment';
import Relay from 'react-relay';

import Card from 'components/card';
import Money from 'components/money';
import Button from 'components/button';
import DateTime from 'components/date-time';

import { MarkTransactionAsSavings } from 'mutations/transactions';

import styles from 'sass/components/list-transaction';


class ListTransaction extends Component {
  static propTypes = {
    expanded: PropTypes.bool,
    onClick: PropTypes.func,
  };

  static defaultProps = {
    expanded: false,
  };

  markAsFromSavings() {
    const { transaction } = this.props;

    Relay.Store.commitUpdate(new MarkTransactionAsSavings({ transaction }), {
      onSuccess: ()=> console.log('MarkTransactionAsSavings Success'),
      onFailure: ()=> console.log('MarkTransactionAsSavings Failure'),
    });
  }

  render() {
    const { transaction, expanded, onClick } = this.props;

    return (
      <Card className={`transaction ${styles.root}`} expanded={expanded}>
        <div className='summary' onClick={onClick}>
          <div className='name'>
            {transaction.description}
          </div>
          <div className='buckets'>
            {transaction.buckets.edges.map(({ node })=>
              <span key={node.id}>{node.name}</span>
            )}
          </div>
          <div className='date'>
            <DateTime value={transaction.date} format='Do'/>
          </div>
          <div className='amount'>
            <Money amount={transaction.amount} abs={true}/>
          </div>
        </div>
        <div className='extanded-content'>
          <ul className='list-unstyled'>
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
            </li>
            <li>
              <strong>{'Buckets: '}</strong>
              <div className='buckets'>
                {transaction.buckets.edges.map(({ node })=>
                  <span key={node.id}>{node.name}</span>
                )}
              </div>
            </li>
          </ul>

          <Button onClick={::this.markAsFromSavings} variant='primary'>
            Mark As Spend From Savings
          </Button>
        </div>
      </Card>
    );
  }
}

ListTransaction = Relay.createContainer(ListTransaction, {
  fragments: {
    transaction: ()=> Relay.QL`
      fragment on TransactionNode {
        ${MarkTransactionAsSavings.getFragment('transaction')}
        description
        amount
        date
        category { name }
        account { name }
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
