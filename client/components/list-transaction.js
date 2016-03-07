
import { Component, PropTypes } from 'react';
import Relay from 'react-relay';
import Row from 'muicss/lib/react/row';
import Col from 'muicss/lib/react/col';

import Card from 'components/card';
import Money from 'components/money';
import DateTime from 'components/date-time';

import { ToggleTransactionFromSavings } from 'mutations/transactions';

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

  componentWillReceiveProps(nextProps) {
    if (nextProps.expanded !== this.props.expanded)
      this.props.relay.setVariables({ open: nextProps.expanded });
  }

  markAsFromSavings() {
    const { transaction } = this.props;

    Relay.Store.commitUpdate(new ToggleTransactionFromSavings({ transaction }), {
      onSuccess: ()=> console.log('ToggleTransactionFromSavings Success'),
      onFailure: ()=> console.log('ToggleTransactionFromSavings Failure'),
    });
  }

  render() {
    const { transaction, expanded, onClick, abs, relay } = this.props;

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
              <DateTime value={transaction.date} format='ddd • Do'/>
            </div>
            <div className='amount'>
              <Money amount={transaction.amount} abs={abs}/>
            </div>
          </div>
        }
      >
        {relay.variables.open ?
          <div>
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

            <div className='from-savings-toggle' onClick={::this.markAsFromSavings}>
              <div className='from-savings-check'>
                <i className={`fa fa-${transaction.fromSavings ? 'check-' : ''}square-o`}/>
              </div>
              <div className='from-savings-copy'>
                <div><strong>
                  {'Remove from '}
                  <DateTime value={transaction.date} format='MMMM'/>
                  {' expenses'}
                </strong></div>
                <div>
                  Only use if this money was saved before
                  {' '}<DateTime value={transaction.date} format='MMMM'/>.
                </div>
              </div>
            </div>
          </div>
        : null}
      </Card>
    );
  }
}

ListTransaction = Relay.createContainer(ListTransaction, {
  initialVariables: {
    open: false,
  },
  fragments: {
    transaction: ()=> Relay.QL`
      fragment on TransactionNode {
        ${ToggleTransactionFromSavings.getFragment('transaction')}

        description
        amount
        date

        category {
          name
        }

        buckets(first: 10) {
          edges {
            node {
              id
              name
            }
          }
        }

        fromSavings @include(if: $open)

        transferPair @include(if: $open) {
          description
          amount
        }

        account @include(if: $open) {
          id
          name
          institution {
            id
            name
          }
        }
      }
    `,
  },
});

export default ListTransaction;
