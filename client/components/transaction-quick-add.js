
import { Component } from 'react';
import Relay from 'react-relay';

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

  addToBucket(bucket) {
    const { viewer, transaction } = this.props;

    this.setState({ loading: true });
    Relay.Store.commitUpdate(new TransactionQuickAddMutation({ viewer, transaction, bucket }), {
      onFailure: ()=> {
        console.log('Failure: TransactionQuickAddMutation');
        this.setState({ loading: false });
      },
      onSuccess: ()=> {
        console.log('Success: TransactionQuickAddMutation');
        this.setState({ loading: false });
      },
    });
  }

  render() {
    const { viewer, relay } = this.props;
    const { focus } = this.state;

    return (
      <div className={styles.root}>
        <TextInput
          label='Add To Label'
          onChange={(searchValue)=> relay.setVariables({ searchValue })}
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
              <span>None Found</span>
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
      }
    `,
  },
});

export default TransactionQuickAdd;
