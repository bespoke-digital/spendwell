
import { Component, PropTypes } from 'react';
import Relay from 'react-relay';
import Row from 'muicss/lib/react/row';
import Col from 'muicss/lib/react/col';

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
            <div className='buckets'>
              {transaction.buckets.edges.map(({ node })=>
                <span key={node.id}>{node.name}</span>
              )}
            </div>
            <div className='date'>
              <DateTime value={transaction.date} format='ddd [the] Do'/>
            </div>
            <div className='amount'>
              <Money amount={transaction.amount} abs={abs}/>
            </div>
          </div>
        }
      >
        <Row>
          <Col md='6'>
            <strong>{'Date: '}</strong><DateTime value={transaction.date}/><br/>
            <strong>{'Amount: '}</strong><Money amount={transaction.amount}/>
          </Col>
          <Col md='6'>
            <strong>{'Account: '}</strong>{transaction.account.name}<br/>
            <strong>{'Institution: '}</strong>{transaction.account.institution.name}
          </Col>
        </Row>

        {transaction.buckets.edges.length ?
          <div className='section'>
            <hr/>
            <strong>{'Buckets: '}</strong>
            <span className='buckets'>
              {transaction.buckets.edges.map(({ node })=>
                <span key={node.id}>{node.name}</span>
              )}
            </span>
          </div>
        : null}

        {transaction.transferPair ?
          <div className='section'>
            <hr/>
            <strong>{'Transfer Pair: '}</strong>
            {transaction.transferPair.description}
            {' - '}
            <Money amount={transaction.transferPair.amount}/>
          </div>
        : null}

        <Button
          onClick={::this.markAsFromSavings}
          variant='primary'
          className='spend-from-savings'
        >
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
