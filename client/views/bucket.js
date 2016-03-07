
import { Component } from 'react';
import { browserHistory } from 'react-router';
import Relay from 'react-relay';

import Button from 'components/button';
import TransactionList from 'components/transaction-list';
import App from 'components/app';
import BucketForm from 'components/bucket-form';
import ScrollTrigger from 'components/scroll-trigger';

import { DeleteBucketMutation, UpdateBucketMutation } from 'mutations/buckets';

import styles from 'sass/views/bucket.scss';


class Bucket extends Component {
  constructor() {
    super();
    this.state = { showSettings: false };
  }

  deleteBucket() {
    const { viewer } = this.props;
    const { bucket } = viewer;

    console.log('DeleteBucketMutation', { viewer, bucket });
    Relay.Store.commitUpdate(new DeleteBucketMutation({ viewer, bucket }), {
      onFailure: ()=> console.log('Failure: DeleteBucketMutation'),
      onSuccess: ()=> {
        console.log('Success: DeleteBucketMutation');
        browserHistory.push('/app/dashboard');
      },
    });
  }

  updateBucket(data) {
    const { viewer } = this.props;

    const args = {
      viewer,
      bucket: viewer.bucket,
      name: data.name,
      filters: data.filters,
    };

    console.log('UpdateBucketMutation', args);
    Relay.Store.commitUpdate(new UpdateBucketMutation(args), {
      onFailure: ()=> console.log('Failure: UpdateBucketMutation'),
      onSuccess: ()=> console.log('Success: UpdateBucketMutation'),
    });
  }

  toggleSettings() {
    const { showSettings } = this.state;
    this.setState({ showSettings: !showSettings });
  }

  loadTransactions() {
    const { relay } = this.props;
    const { transactionCount } = relay.variables;

    relay.setVariables({ transactionCount: transactionCount + 20 });
  }

  render() {
    const { viewer } = this.props;
    const { showSettings } = this.state;

    if (!viewer.bucket)
      return this.render404();

    return (
      <App viewer={viewer} back={true}>
        <ScrollTrigger
          className={`container ${styles.root}`}
          onTrigger={::this.loadTransactions}
        >

          <div className='heading'>
            <h1>{viewer.bucket.name}</h1>

            <Button onClick={::this.toggleSettings} flat>
              <i className='fa fa-cog'/>
            </Button>
            <Button onClick={::this.deleteBucket} flat variant='danger'>
              <i className='fa fa-times'/>
            </Button>
          </div>

          {showSettings ?
            <BucketForm
              viewer={viewer}
              bucket={viewer.bucket}
              onSubmit={::this.updateBucket}
              onCancel={::this.toggleSettings}
            />
          : null}

          <TransactionList
            transactions={viewer.bucket.transactions}
            monthHeaders={true}
          />
        </ScrollTrigger>
      </App>
    );
  }

  render404() {
    return (
      <div className={`container ${styles.root}`}>
        <div className='heading'>
          <Button onClick={()=> browserHistory.goBack()} className='back'>
            <i className='fa fa-long-arrow-left'/>
          </Button>
          <h1>Bucket Not Found</h1>
        </div>
      </div>
    );
  }
}

Bucket = Relay.createContainer(Bucket, {
  initialVariables: {
    id: null,
    transactionsCount: 20,
  },
  fragments: {
    viewer: ()=> Relay.QL`
      fragment on Viewer {
        ${App.getFragment('viewer')}
        ${BucketForm.getFragment('viewer')}
        ${DeleteBucketMutation.getFragment('viewer')}
        ${UpdateBucketMutation.getFragment('viewer')}

        bucket(id: $id) {
          ${DeleteBucketMutation.getFragment('bucket')}
          ${UpdateBucketMutation.getFragment('bucket')}
          ${BucketForm.getFragment('bucket')}

          name
          transactions(first: $transactionsCount) {
            ${TransactionList.getFragment('transactions')}
          }
        }
      }
    `,
  },
});

export default Bucket;
