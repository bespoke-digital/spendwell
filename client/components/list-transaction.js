
import { Component, PropTypes } from 'react'
import Relay from 'react-relay'

import Card from 'components/card'
import Money from 'components/money'
import DateTime from 'components/date-time'
import TransactionQuickAdd from 'components/transaction-quick-add'
import Button from 'components/button'
import CardActions from 'components/card-actions'
import Icon from 'components/icon'
import IconList from 'components/icon-list'
import Chip from 'components/chip'
import UpdateBucketSheet from 'components/update-bucket-sheet'

import eventEmitter from 'utils/event-emitter'
import { handleMutationError } from 'utils/network-layer'
import { DeleteTransactionMutation } from 'mutations/transactions'

import styles from 'sass/components/list-transaction'


class ListTransaction extends Component {
  static propTypes = {
    abs: PropTypes.bool.isRequired,
    months: PropTypes.bool.isRequired,
    expanded: PropTypes.bool,
    onClick: PropTypes.func,
  };

  static defaultProps = {
    expanded: false,
  };

  state = {
    loading: false,
    quickAdd: false,
    editBucket: null,
  };

  componentWillReceiveProps (nextProps) {
    if (nextProps.expanded !== this.props.expanded)
      this.props.relay.setVariables({ open: nextProps.expanded })
  }

  handleDelete () {
    const { transaction, relay } = this.props

    this.setState({ loading: true })
    Relay.Store.commitUpdate(new DeleteTransactionMutation({ transaction }), {
      onFailure: (response) => {
        this.setState({ loading: false })
        handleMutationError(response)
      },
      onSuccess: () => {
        console.log('Success: DeleteTransactionMutation')
        this.setState({ loading: false })
        relay.forceFetch()
      },
    })
  }

  render () {
    const { viewer, transaction, expanded, onClick, abs, months, relay } = this.props
    const { loading, quickAdd, editBucket } = this.state

    return (
      <Card
        className={`transaction ${styles.root}`}
        expanded={expanded}
        onSummaryClick={onClick}
        loading={loading}
        summary={
          <div>
            <div className='description'>
              {transaction.description}
            </div>
            <div className='buckets'>
              {transaction.buckets.edges.map(({ node }) =>
                <span key={node.id}>{node.name}</span>
              )}
            </div>
            <div className={`date ${months ? 'months' : ''}`}>
              <DateTime
                value={transaction.date}
                format={months ? 'ddd • MMM Do' : 'ddd • Do'}
              />
            </div>
            <div className='amount'>
              <Money amount={transaction.amount} abs={abs}/>
            </div>
          </div>
        }
      >
        {relay.variables.open ?
          <div>
            <IconList>
              <div>
                <Icon type='local atm'/>
                <div className='content'>{transaction.description}</div>
                <div className='label'>Description</div>
              </div>
              {transaction.rawDescription && transaction.rawDescription.toUpperCase() !== transaction.description.toUpperCase() ?
                <div>
                  <div className='content'>{transaction.rawDescription}</div>
                  <div className='label'>Original Description</div>
                </div>
              : null}
              <div>
                <div className='content'><DateTime value={transaction.date}/></div>
                <div className='label'>Date</div>
              </div>
              <div>
                <div className='content'><Money amount={transaction.amount}/></div>
                <div className='label'>Amount</div>
              </div>
              <div className='divider'>
                <Icon type='account balance'/>
                <div className='content'>{transaction.account.name}</div>
                <div className='label'>Account</div>
              </div>
              <div>
                <div className='content'>{transaction.account.institution.name}</div>
                <div className='label'>Institution</div>
              </div>
              {transaction.transferPair ?
                <div>
                  <Icon type='input'/>
                  <div className='content'>{transaction.transferPair.account.name}</div>
                  <div className='label'>Transfer To</div>
                </div>
              : null}
              {transaction.buckets.edges.length ?
                <div className='divider'>
                  <Icon type='local offer'/>
                  <div className='content buckets'>
                    {transaction.buckets.edges.map(({ node }) =>
                      <Chip
                        key={node.id}
                        className='bucket-chip'
                        onClick={() => this.setState({ editBucket: node.id })}
                      >
                        {node.name}
                        <Icon type='edit'/>

                        <UpdateBucketSheet
                          viewer={viewer}
                          bucket={node}
                          visible={editBucket === node.id}
                          onRequestClose={() => this.setState({ editBucket: null })}
                          onUpdated={() => eventEmitter.emit('forceFetch')}
                          onDeleted={() => eventEmitter.emit('forceFetch')}
                        />
                      </Chip>
                    )}
                  </div>
                  <div className='label buckets-label'>Labels</div>
                </div>
              : null}
            </IconList>

            {quickAdd ?
              <TransactionQuickAdd
                viewer={viewer}
                transaction={transaction}
                onRemove={() => this.setState({ quickAdd: false })}
              />
            :
              <CardActions>
                <Button onClick={() => this.setState({ quickAdd: true })}>Quick Add</Button>
                {transaction.source === 'csv' ?
                  <Button onClick={::this.handleDelete}>Delete</Button>
                : null}
              </CardActions>
            }
          </div>
        : null}
      </Card>
    )
  }
}

ListTransaction = Relay.createContainer(ListTransaction, {
  initialVariables: {
    open: false,
  },
  fragments: {
    viewer: () => Relay.QL`
      fragment on Viewer {
        ${TransactionQuickAdd.getFragment('viewer')}
        ${UpdateBucketSheet.getFragment('viewer')}
      }
    `,
    transaction: () => Relay.QL`
      fragment on TransactionNode {
        ${TransactionQuickAdd.getFragment('transaction')}
        ${DeleteTransactionMutation.getFragment('transaction')}

        description
        rawDescription
        amount
        date
        source

        buckets(first: 10) {
          edges {
            node {
              ${UpdateBucketSheet.getFragment('bucket')}

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
})

export default ListTransaction
