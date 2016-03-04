
import Relay from 'react-relay';
import { Component } from 'react';
import { browserHistory } from 'react-router';

import BucketForm from 'components/bucket-form';
import App from 'components/app';

import { CreateBucketMutation } from 'mutations/buckets';

import styles from 'sass/views/create-bucket.scss';


class CreateBucket extends Component {
  handleSubmit({ filters, name }) {
    const { viewer } = this.props;

    Relay.Store.commitUpdate(new CreateBucketMutation({ viewer, name, filters, type: 'expense' }), {
      onFailure: ()=> console.log('Failure: CreateBucketMutation'),
      onSuccess: ()=> {
        console.log('Success: CreateBucketMutation');
        browserHistory.push('/app/dashboard');
      },
    });
  }

  render() {
    const { viewer } = this.props;

    return (
      <App viewer={viewer} back={true}>
        <div className={`container ${styles.root}`}>
          <div className='heading'>
            <h1>New Bucket</h1>
          </div>

          <BucketForm
            onSubmit={::this.handleSubmit}
            onCancel={()=> browserHistory.goBack()}
            viewer={viewer}
            bucket={null}
          />
        </div>
      </App>
    );
  }
}

CreateBucket = Relay.createContainer(CreateBucket, {
  initialVariables: {
    filters: [],
    count: 50,
  },
  fragments: {
    viewer: ()=> Relay.QL`
      fragment on Viewer {
        ${App.getFragment('viewer')}
        ${CreateBucketMutation.getFragment('viewer')}
        ${BucketForm.getFragment('viewer')}
      }
    `,
  },
});

export default CreateBucket;
