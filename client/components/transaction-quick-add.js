
import { PropTypes, Component } from 'react'
import Relay from 'react-relay'

import { handleMutationError } from 'utils/network-layer'
import Card from 'components/card'
import A from 'components/a'
import Icon from 'components/icon'
import TextInput from 'components/text-input'
import Transition from 'components/transition'
import CreateBucketSheet from 'components/create-bucket-sheet'

import track from 'utils/track'
import eventEmitter from 'utils/event-emitter'
import { TransactionQuickAddMutation } from 'mutations/transactions'

import styles from 'sass/components/transaction-quick-add'


class TransactionQuickAdd extends Component {
  static propTypes = {
    onRemove: PropTypes.func.isRequired,
  };

  state = {
    loading: false,
    createBucketType: null,
    createBucket: false,
  };

  getResponseHandler (clbk) {
    const { relay } = this.props

    return {
      onFailure: (response) => {
        this.setState({ loading: false })
        handleMutationError(response)
      },
      onSuccess: (response) => {
        console.log('Success: TransactionQuickAddMutation')

        this.setState({ loading: false, searchValue: '' })
        relay.setVariables({ searchValue: '' })

        if (clbk) setTimeout(clbk.bind(this, response), 0)
      },
    }
  }

  addToBucket (bucket) {
    const { relay, viewer, transaction } = this.props

    this.setState({ loading: true })
    Relay.Store.commitUpdate(new TransactionQuickAddMutation({
      viewer,
      transaction,
      bucket,
    }), {
      onFailure: (response) => {
        this.setState({ loading: false })
        handleMutationError(response)
      },
      onSuccess: () => {
        console.log('Success: TransactionQuickAddMutation')

        this.setState({ loading: false, searchValue: '' })
        relay.setVariables({ searchValue: '' })

        eventEmitter.emit('forceFetch')
        track('quick-add', { create: false })
      },
    })
  }

  handleSearchChange (searchValue) {
    const { relay } = this.props

    this.setState({ searchValue })
    relay.setVariables({ searchValue })
  }

  handleCreateComplete () {
    const { relay } = this.props

    this.setState({ searchValue: '' })
    relay.setVariables({ searchValue: '' })
    eventEmitter.emit('forceFetch')
    track('quick-add', { create: true })
  }

  render () {
    const { viewer, transaction, onRemove } = this.props
    const { focus, searchValue, createBucketType, createBucket } = this.state

    return (
      <div className={`transaction-quick-add ${styles.root}`}>
        <TextInput
          ref='input'
          label='Add To Label'
          value={searchValue}
          onChange={::this.handleSearchChange}
          onFocus={() => this.setState({ focus: true })}
          onBlur={() => this.setState({ focus: false })}
        />

        <A onClick={onRemove} className='close'><Icon type='close'/></A>

        <Transition show={!!viewer.buckets && focus} out={true}>
          <Card className='options'>
            {viewer.buckets && viewer.buckets.edges.length ?
              viewer.buckets.edges.map(({ node }) => (
                <A key={node.id} onClick={this.addToBucket.bind(this, node)}>
                  {node.name}
                </A>
              )
            ) : null}
            {searchValue && searchValue.length > 0 ?
              <A onClick={() => this.setState({ createBucketType: 'expense', createBucket: true })}>
                Create "{searchValue}" Label
              </A>
            : null}
            {searchValue && searchValue.length > 0 ?
              <A onClick={() => this.setState({ createBucketType: 'bill', createBucket: true })}>
                Create "{searchValue}" Bill
              </A>
            : null}
            {searchValue && searchValue.length > 0 ?
              <A onClick={() => this.setState({ createBucketType: 'goal', createBucket: true })}>
                Create "{searchValue}" Goal
              </A>
            : null}
          </Card>
        </Transition>

        <CreateBucketSheet
          viewer={viewer}
          visible={createBucket}
          type={createBucketType}
          initialName={searchValue}
          initialFilters={[{ descriptionExact: transaction.description }]}
          onRequestClose={() => this.setState({ createBucket: false })}
          onComplete={::this.handleCreateComplete}
        />
      </div>
    )
  }
}

TransactionQuickAdd = Relay.createContainer(TransactionQuickAdd, {
  initialVariables: {
    open: false,
    searchValue: '',
  },
  prepareVariables: (vars) => ({
    search: !!vars.searchValue,
    ...vars,
  }),
  fragments: {
    viewer: () => Relay.QL`
      fragment on Viewer {
        ${TransactionQuickAddMutation.getFragment('viewer')}
        ${CreateBucketSheet.getFragment('viewer')}

        buckets(first: 10, nameContains: $searchValue) @include(if: $search) {
          edges {
            node {
              ${TransactionQuickAddMutation.getFragment('bucket')}

              id
              name
            }
          }
        }
      }
    `,
    transaction: () => Relay.QL`
      fragment on TransactionNode {
        ${TransactionQuickAddMutation.getFragment('transaction')}

        id
        description

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
})

export default TransactionQuickAdd
