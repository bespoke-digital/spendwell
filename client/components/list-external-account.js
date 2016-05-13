
import { Component, PropTypes } from 'react';
import Relay from 'react-relay';

import Card from 'components/card';
import SuperCard from 'components/super-card';
import Button from 'components/button';
import CardActions from 'components/card-actions';
import TransactionList from 'components/transaction-list';
import UpdateBucketSheet from 'components/update-bucket-sheet';

import eventEmitter from 'utils/event-emitter';


class ListExternalAccount extends Component {
  static propTypes = {
    expanded: PropTypes.bool,
    onClick: PropTypes.func,
  };

  static defaultProps = {
    expanded: false,
  };

  state = {
    updateBucket: false,
  };

  componentWillReceiveProps(nextProps) {
    if (nextProps.expanded !== this.props.expanded)
      this.props.relay.setVariables({ open: nextProps.expanded });
  }

  loadTransactions() {
    const { relay } = this.props;
    const { transactionCount } = relay.variables;

    relay.setVariables({ transactionCount: transactionCount + 20 });
  }

  forceFetch() {
    eventEmitter.emit('forceFetch');
  }

  render() {
    const { viewer, bucket, onClick, relay } = this.props;
    const { open } = relay.variables;
    const { updateBucket } = this.state;

    const hasTransaction = (
      bucket.transactions &&
      bucket.transactions.edges &&
      bucket.transactions.edges.length > 0
    );

    return (
      <SuperCard
        className='account'
        expanded={open}
        onSummaryClick={onClick}
        summary={
          <Card summary={bucket.name} expanded={open}>
            <CardActions>
              <Button onClick={()=> this.setState({ updateBucket: true })}>Edit</Button>
            </CardActions>

            <UpdateBucketSheet
              viewer={viewer}
              bucket={bucket}
              visible={updateBucket}
              onRequestClose={()=> this.setState({ updateBucket: false })}
              onUpdated={::this.forceFetch}
              onDeleted={::this.forceFetch}
            />
          </Card>
        }
      >
        {hasTransaction ?
          <TransactionList viewer={viewer} transactions={bucket.transactions} abs={false}/>
        : null}

        {hasTransaction && bucket.transactions.pageInfo.hasNextPage ?
          <div className='bottom-buttons'>
            <Button onClick={::this.loadTransactions}>Load More</Button>
          </div>
        : null}
      </SuperCard>
    );
  }
}

ListExternalAccount = Relay.createContainer(ListExternalAccount, {
  initialVariables: {
    open: false,
    transactionCount: 20,
  },
  fragments: {
    viewer: ()=> Relay.QL`
      fragment on Viewer {
        ${TransactionList.getFragment('viewer')}
        ${UpdateBucketSheet.getFragment('viewer')}
      }
    `,
    bucket: ()=> Relay.QL`
      fragment on BucketNode {
        ${UpdateBucketSheet.getFragment('bucket')}

        id
        name

        transactions(first: $transactionCount) @include(if: $open) {
          ${TransactionList.getFragment('transactions')}

          pageInfo {
            hasNextPage
          }
        }
      }
    `,
  },
});

export default ListExternalAccount;
