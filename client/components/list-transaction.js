
import { Component, PropTypes } from 'react';
import Relay from 'react-relay';

import Card from 'components/card';
import Money from 'components/money';
import DateTime from 'components/date-time';
import TransactionQuickAdd from 'components/transaction-quick-add';
import A from 'components/a';
import TextActions from 'components/text-actions';
import TodayIcon from 'components/icons/today';
import AttachMoneyIcon from 'components/icons/attach-money';
import AccountBalanceWalletIcon from 'components/icons/account-balance-wallet';
import PaymentIcon from 'components/icons/payment';
import BookmarkOutlineIcon from 'components/icons/bookmark-outline';
import InputIcon from 'components/icons/input';

import { handleMutationError } from 'utils/network-layer';
import { DeleteTransactionMutation } from 'mutations/transactions';

import styles from 'sass/components/list-transaction';


class ListTransaction extends Component {
  static propTypes = {
    abs: PropTypes.bool.isRequired,
    dateFormat: PropTypes.string.isRequired,
    expanded: PropTypes.bool,
    onClick: PropTypes.func,
  };

  static defaultProps = {
    expanded: false,
  };

  state = {
    loading: false,
  };

  componentWillReceiveProps(nextProps) {
    if (nextProps.expanded !== this.props.expanded)
      this.props.relay.setVariables({ open: nextProps.expanded });
  }

  handleDelete() {
    const { transaction, relay } = this.props;

    this.setState({ loading: true });
    Relay.Store.commitUpdate(new DeleteTransactionMutation({ transaction }), {
      onFailure: (response)=> {
        this.setState({ loading: false });
        handleMutationError(response);
      },
      onSuccess: ()=> {
        console.log('Success: DeleteTransactionMutation');
        this.setState({ loading: false });
        relay.forceFetch();
      },
    });
  }

  render() {
    const { viewer, transaction, expanded, onClick, abs, dateFormat, relay } = this.props;
    const { loading } = this.state;

    return (
      <Card
        className={`transaction ${styles.root}`}
        expanded={expanded}
        onSummaryClick={onClick}
        loading={loading}
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
              <DateTime value={transaction.date} format={dateFormat}/>
            </div>
            <div className='amount'>
              <Money amount={transaction.amount} abs={abs}/>
            </div>
          </div>
        }
      >
        {relay.variables.open ?
          <div>
            <div className='icon-list'>
              <div>
                <TodayIcon/>
                <div className='content'><DateTime value={transaction.date}/></div>
              </div>
              <div>
                <AttachMoneyIcon/>
                <div className='content'><Money amount={transaction.amount}/></div>
              </div>
              {transaction.buckets.edges.length ?
                <div>
                  <BookmarkOutlineIcon/>
                  <div className='content buckets'>
                    {transaction.buckets.edges.map(({ node })=>
                      <span key={node.id}>{node.name}</span>
                    )}
                  </div>
                  <div className='label'>Labels</div>
                </div>
              : null}
              <div>
                <PaymentIcon/>
                <div className='content'>{transaction.account.name}</div>
                <div className='label'>Account</div>
              </div>
              <div>
                <AccountBalanceWalletIcon/>
                <div className='content'>{transaction.account.institution.name}</div>
                <div className='label'>Institution</div>
              </div>
              {transaction.transferPair ?
                <div>
                  <InputIcon/>
                  <div className='content'>{transaction.transferPair.account.name}</div>
                  <div className='label'>Transfer To</div>
                </div>
              : null}
            </div>

            <TransactionQuickAdd viewer={viewer} transaction={transaction}/>

            <TextActions>
              <A onClick={::this.handleDelete}>Delete</A>
            </TextActions>
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
    viewer: ()=> Relay.QL`
      fragment on Viewer {
        ${TransactionQuickAdd.getFragment('viewer')}
      }
    `,
    transaction: ()=> Relay.QL`
      fragment on TransactionNode {
        ${TransactionQuickAdd.getFragment('transaction')}
        ${DeleteTransactionMutation.getFragment('transaction')}

        description
        amount
        date
        source

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
          account {
            name
          }
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
