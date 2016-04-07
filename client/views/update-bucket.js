
import Relay from 'react-relay';
import { Component } from 'react';
import { browserHistory } from 'react-router';

import App from 'components/app';
import BucketForm from 'components/bucket-form';
import Button from 'components/button';
import Dialog from 'components/dialog';

import { DeleteBucketMutation, UpdateBucketMutation } from 'mutations/buckets';

import styles from 'sass/views/create-bucket.scss';


class UpdateBucket extends Component {
  constructor() {
    super();
    this.state = {
      updateLoading: false,
      deleteLoading: false,
      confirmDelete: false,
    };
  }

  deleteBucket() {
    const { viewer } = this.props;
    const { bucket } = viewer;

    this.setState({ deleteLoading: true });
    Relay.Store.commitUpdate(new DeleteBucketMutation({ viewer, bucket }), {
      onFailure: ()=> {
        console.log('Failure: DeleteBucketMutation');
        this.setState({ deleteLoading: false });
        this.setState({ confirmDelete: false });
      },
      onSuccess: ()=> {
        console.log('Success: DeleteBucketMutation');
        this.setState({ deleteLoading: false });
        this.setState({ confirmDelete: false });
        browserHistory.push('/app/dashboard');
      },
    });
  }

  updateBucket({ filters, name, type }) {
    const { viewer } = this.props;

    const args = {
      viewer,
      bucket: viewer.bucket,
      name,
      type,
      filters,
    };

    this.setState({ updateLoading: true });
    Relay.Store.commitUpdate(new UpdateBucketMutation(args), {
      onFailure: ()=> {
        console.log('Failure: UpdateBucketMutation');
        this.setState({ updateLoading: false });
      },
      onSuccess: ()=> {
        console.log('Success: UpdateBucketMutation');
        this.setState({ updateLoading: false });
        browserHistory.push('/app/dashboard');
      },
    });
  }

  render() {
    const { viewer } = this.props;
    const { updateLoading, deleteLoading, confirmDelete } = this.state;

    if (!viewer.bucket) return null;

    return (
      <App
        viewer={viewer}
        back={true}
        onOverlayClose={()=> this.setState({ confirmDelete: false })}
      >
        <div className={`container ${styles.root}`}>
          <div className='heading'>
            <h1>Edit {viewer.bucket.name}</h1>

            <Button
              onClick={()=> this.setState({ confirmDelete: true })}
              variant='danger'
              flat
            >Delete</Button>
          </div>

          {confirmDelete ?
            <Dialog size='sm' onRequestClose={()=> this.setState({ confirmDelete: false })}>
              <div className='body'>
                Are you sure? You can't take it back.
              </div>
              <div className='actions'>
                <Button
                  onClick={()=> this.setState({ confirmDelete: false })}
                >Cancel</Button>
                <Button
                  onClick={::this.deleteBucket}
                  variant='danger'
                  loading={deleteLoading}
                >Delete</Button>
              </div>
            </Dialog>
          : null}

          <BucketForm
            viewer={viewer}
            bucket={viewer.bucket}
            onSubmit={::this.updateBucket}
            onCancel={()=> browserHistory.goBack()}
            loading={updateLoading}
          />
        </div>
      </App>
    );
  }
}

UpdateBucket = Relay.createContainer(UpdateBucket, {
  initialVariables: { id: null },
  fragments: {
    viewer: ()=> Relay.QL`
      fragment on Viewer {
        ${App.getFragment('viewer')}
        ${BucketForm.getFragment('viewer')}
        ${UpdateBucketMutation.getFragment('viewer')}
        ${DeleteBucketMutation.getFragment('viewer')}

        bucket(id: $id) {
          ${BucketForm.getFragment('bucket')}
          ${UpdateBucketMutation.getFragment('bucket')}
          ${DeleteBucketMutation.getFragment('bucket')}

          name
        }
      }
    `,
  },
});

export default UpdateBucket;
