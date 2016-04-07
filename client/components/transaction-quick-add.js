
import { Component } from 'react';
import Relay from 'react-relay';
import { browserHistory } from 'react-router';

import Card from 'components/card';
import A from 'components/a';
import TextInput from 'components/text-input';
import Transition from 'components/transition';

import { TransactionQuickAddMutation } from 'mutations/transactions';

import styles from 'sass/components/transaction-quick-add';


class TransactionQuickAdd extends Component {
  constructor() {
    super();
    this.state = { loading: false };
  }

  getResponseHandler(clbk) {
    const { relay } = this.props;

    return {
      onFailure: ()=> {
        console.log('Failure: TransactionQuickAddMutation');
        this.setState({ loading: false });
      },
      onSuccess: (response)=> {
        console.log('Success: TransactionQuickAddMutation');

        this.setState({ loading: false, searchValue: '' });
        relay.setVariables({ searchValue: '' });

        if (clbk) setTimeout(clbk.bind(this, response), 0);
      },
    };
  }

  createBucket() {
    const { viewer, transaction } = this.props;
    const { searchValue } = this.state;

    this.setState({ loading: true });
    Relay.Store.commitUpdate(new TransactionQuickAddMutation({
      viewer,
      transaction,
      bucket: null,
      bucketName: searchValue,
    }), this.getResponseHandler((response)=> {
      const { transaction } = this.props;

      if (!transaction.buckets) {
        console.warn('No transaction buckets after quick-add', response, transaction);
        return;
      }

      const newBucketEdge = transaction.buckets.edges.find(({ node })=> node.name === searchValue);
      const newBucketId = newBucketEdge ? newBucketEdge.node.id : null;

      if (!newBucketId) {
        console.warn('New bucket not found after quick-add', response, transaction);
        return;
      }

      browserHistory.push(`/app/labels/${newBucketId}/edit`);
    }));
  }

  addToBucket(bucket) {
    const { viewer, transaction } = this.props;

    this.setState({ loading: true });
    Relay.Store.commitUpdate(new TransactionQuickAddMutation({
      viewer,
      transaction,
      bucket,
    }), this.getResponseHandler());
  }

  handleSearchChange(searchValue) {
    const { relay } = this.props;

    this.setState({ searchValue });
    relay.setVariables({ searchValue });
  }

  render() {
    const { viewer } = this.props;
    const { focus, searchValue } = this.state;

    return (
      <div className={styles.root}>
        <TextInput
          ref='input'
          label='Add To Label'
          value={searchValue}
          onChange={::this.handleSearchChange}
          onFocus={()=> this.setState({ focus: true })}
          onBlur={()=> this.setState({ focus: false })}
        />
        <Transition show={!!viewer.buckets && focus} out={true}>
          <Card className='options'>
            {viewer.buckets && viewer.buckets.edges.length ?
              viewer.buckets.edges.map(({ node })=> (
                <A key={node.id} onClick={this.addToBucket.bind(this, node)}>
                  {node.name}
                </A>
              )
            ) :
              <A onClick={::this.createBucket}>
                Create "{searchValue}" label
              </A>
            }
          </Card>
        </Transition>
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

        buckets(first: 10, name_Icontains: $searchValue) @include(if: $search) {
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
