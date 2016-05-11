
import { PropTypes, Component } from 'react';
import Relay from 'react-relay';
import { browserHistory } from 'react-router';

import { handleMutationError } from 'utils/network-layer';
import Card from 'components/card';
import A from 'components/a';
import Icon from 'components/icon';
import TextInput from 'components/text-input';
import Transition from 'components/transition';
import CreateBucketSheet from 'components/create-bucket-sheet';

import { TransactionQuickAddMutation } from 'mutations/transactions';

import styles from 'sass/components/transaction-quick-add';


class TransactionQuickAdd extends Component {
  static propTypes = {
    onRemove: PropTypes.func.isRequired,
  };

  state = {
    loading: false,
    createBucketType: null,
  };

  getResponseHandler(clbk) {
    const { relay } = this.props;

    return {
      onFailure: (response)=> {
        this.setState({ loading: false });
        handleMutationError(response);
      },
      onSuccess: (response)=> {
        console.log('Success: TransactionQuickAddMutation');

        this.setState({ loading: false, searchValue: '' });
        relay.setVariables({ searchValue: '' });

        if (clbk) setTimeout(clbk.bind(this, response), 0);
      },
    };
  }

  // createBucket() {
  //   const { viewer, transaction } = this.props;
  //   const { searchValue } = this.state;

  //   this.setState({ loading: true });
  //   Relay.Store.commitUpdate(new TransactionQuickAddMutation({
  //     viewer,
  //     transaction,
  //     bucket: null,
  //     bucketName: searchValue,
  //   }), {
  //     onFailure: (response)=> {
  //       this.setState({ loading: false });
  //       handleMutationError(response);
  //     },
  //     onSuccess: (response)=> {
  //       console.log('Success: TransactionQuickAddMutation');
  //       this.setState({ loading: false });

  //       // Need to clear the stack to props.transaction gets updates
  //       // from mutation response
  //       setTimeout(()=> {
  //         const { transaction } = this.props;

  //         if (!transaction.buckets) {
  //           console.warn('No transaction buckets after quick-add', response, transaction);
  //           return;
  //         }

  //         const newBucketEdge = transaction.buckets.edges.find(({ node })=> node.name === searchValue);
  //         const newBucketId = newBucketEdge ? newBucketEdge.node.id : null;

  //         if (!newBucketId) {
  //           console.warn('New bucket not found after quick-add', response, transaction);
  //           return;
  //         }

  //         browserHistory.push(`/app/labels/${newBucketId}/edit`);
  //       }, 0);
  //     },
  //   });
  // }

  addToBucket(bucket) {
    const { relay, viewer, transaction } = this.props;

    this.setState({ loading: true });
    Relay.Store.commitUpdate(new TransactionQuickAddMutation({
      viewer,
      transaction,
      bucket,
    }), {
      onFailure: (response)=> {
        this.setState({ loading: false });
        handleMutationError(response);
      },
      onSuccess: ()=> {
        console.log('Success: TransactionQuickAddMutation');

        this.setState({ loading: false, searchValue: '' });
        relay.setVariables({ searchValue: '' });

        relay.forceFetch();
      },
    });
  }

  handleSearchChange(searchValue) {
    const { relay } = this.props;

    this.setState({ searchValue });
    relay.setVariables({ searchValue });
  }

  render() {
    const { viewer, transaction, onRemove } = this.props;
    const { focus, searchValue, createBucketType } = this.state;

    return (
      <div className={`transaction-quick-add ${styles.root}`}>
        <TextInput
          ref='input'
          label='Add To Label'
          value={searchValue}
          onChange={::this.handleSearchChange}
          onFocus={()=> this.setState({ focus: true })}
          onBlur={()=> this.setState({ focus: false })}
        />

        <A onClick={onRemove} className='close'><Icon type='close'/></A>

        <Transition show={!!viewer.buckets && focus} out={true}>
          <Card className='options'>
            {viewer.buckets && viewer.buckets.edges.length ?
              viewer.buckets.edges.map(({ node })=> (
                <A key={node.id} onClick={this.addToBucket.bind(this, node)}>
                  {node.name}
                </A>
              )
            ) : null}
            {searchValue && searchValue.length > 0 ?
              <A onClick={()=> this.setState({ createBucketType: 'expense' })}>
                Create "{searchValue}" Label
              </A>
            : null}
            {searchValue && searchValue.length > 0 ?
              <A onClick={()=> this.setState({ createBucketType: 'bill' })}>
                Create "{searchValue}" Bill
              </A>
            : null}
          </Card>
        </Transition>

        <CreateBucketSheet
          viewer={viewer}
          visible={createBucketType !== null}
          type={createBucketType}
          initialName={searchValue}
          initialFilters={[{ descriptionExact: transaction.description }]}
          onRequestClose={()=> this.setState({ createBucketType: null })}
          onComplete={()=> this.setState({ searchValue: '' })}
        />
      </div>
    );
  }
}

TransactionQuickAdd = Relay.createContainer(TransactionQuickAdd, {
  initialVariables: {
    open: false,
    searchValue: '',
  },
  prepareVariables: (vars)=> ({
    search: !!vars.searchValue,
    ...vars,
  }),
  fragments: {
    viewer: ()=> Relay.QL`
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
    transaction: ()=> Relay.QL`
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
});

export default TransactionQuickAdd;
