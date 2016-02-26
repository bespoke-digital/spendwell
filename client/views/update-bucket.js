
import Relay from 'react-relay';
import { Component } from 'react';
import { browserHistory } from 'react-router';

import Button from 'components/button';
import BucketForm from 'components/bucket-form';
import App from 'components/app';

import { UpdateBucketMutation } from 'mutations/buckets';

import styles from 'sass/views/create-bucket.scss';


class UpdateBucket extends Component {
  handleSubmit({ filters, name }) {
    const { viewer } = this.props;

    Relay.Store.commitUpdate(new UpdateBucketMutation({ viewer, name, filters }), {
      onSuccess: ()=> {
        console.log('UpdateBucketMutation Success');
        browserHistory.goBack();
      },
      onFailure: ()=> console.log('UpdateBucketMutation Failure'),
    });
  }

  render() {
    const { viewer } = this.props;
    return (
      <App viewer={viewer}>
        <div className={`container ${styles.root}`}>
          <div className='heading'>
            <Button onClick={()=> browserHistory.goBack()} className='back'>
              <i className='fa fa-long-arrow-left'/>
            </Button>

            <h1>Edit Bucket</h1>
          </div>

          <BucketForm
            onSubmit={::this.handleSubmit}
            viewer={viewer}
            bucket={viewer.bucket}
          />
        </div>
      </App>
    );
  }
}

UpdateBucket = Relay.createContainer(UpdateBucket, {
  initialVariables: {
    bucketId: null,
  },
  fragments: {
    viewer: ()=> Relay.QL`
      fragment on Viewer {
        ${App.getFragment('viewer')}
        ${UpdateBucketMutation.getFragment('viewer')}
        ${BucketForm.getFragment('viewer')}

        bucket(id: $bucketId) {
          ${BucketForm.getFragment('bucket')}
        }
      }
    `,
  },
});

export default UpdateBucket;
