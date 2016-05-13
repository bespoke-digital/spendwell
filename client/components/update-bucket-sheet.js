
import Relay from 'react-relay';
import { Component, PropTypes } from 'react';

import BucketForm from 'components/bucket-form';
import BottomSheet from 'components/bottom-sheet';
import Button from 'components/button';
import Dialog from 'components/dialog';

import { handleMutationError } from 'utils/network-layer';
import { DeleteBucketMutation, UpdateBucketMutation } from 'mutations/buckets';

import styles from 'sass/components/create-bucket-sheet';


class UpdateBucketSheet extends Component {
  static propTypes = {
    onRequestClose: PropTypes.func.isRequired,
    onUpdated: PropTypes.func,
    onDeleted: PropTypes.func,
    visible: PropTypes.bool.isRequired,
  };

  state = {
    updateLoading: false,
    deleteLoading: false,
    confirmDelete: false,
  };

  componentWillReceiveProps(nextProps) {
    if (nextProps.visible !== this.props.visible)
      this.props.relay.setVariables({ open: nextProps.visible });
  }

  handleDelete() {
    const { viewer, bucket, onDeleted, onRequestClose } = this.props;

    this.setState({ deleteLoading: true });
    Relay.Store.commitUpdate(new DeleteBucketMutation({ viewer, bucket }), {
      onFailure: (response)=> {
        this.setState({ deleteLoading: false, confirmDelete: false });
        handleMutationError(response);
      },
      onSuccess: ()=> {
        console.log('Success: DeleteBucketMutation');
        this.setState({ deleteLoading: false, confirmDelete: false });

        if (onDeleted)
          onDeleted();

        onRequestClose();
      },
    });
  }

  handleUpdate() {
    const { viewer, bucket, onUpdated, onRequestClose } = this.props;
    const { updateLoading } = this.state;
    const bucketForm = this.refs.bucketForm.refs.component;

    if (!bucketForm.isValid() || updateLoading)
      return;

    const args = { viewer, bucket, ...bucketForm.getData() };

    this.setState({ updateLoading: true });
    Relay.Store.commitUpdate(new UpdateBucketMutation(args), {
      onFailure: (response)=> {
        this.setState({ updateLoading: false });
        handleMutationError(response);
      },
      onSuccess: ()=> {
        console.log('Success: UpdateBucketMutation');
        this.setState({ updateLoading: false });

        if (onUpdated)
          onUpdated();

        onRequestClose();
      },
    });
  }

  render() {
    const { viewer, bucket, onRequestClose, relay } = this.props;
    const { open } = relay.variables;
    const { updateLoading, deleteLoading, confirmDelete } = this.state;

    return (
      <BottomSheet
        className={`${styles.root} ${bucket.type}`}
        visible={open}
        onRequestClose={onRequestClose}
        title={`Edit ${bucket.name}`}
        actions={<span>
          <Button
            className='action'
            onClick={()=> this.setState({ confirmDelete: true })}
            plain
            color='light'
            loading={deleteLoading}
          >Delete</Button>
          <Button
            className='action'
            onClick={::this.handleUpdate}
            plain
            color='light'
            loading={updateLoading}
          >Save</Button>
        </span>}
      >
        {confirmDelete ?
          <Dialog size='sm' onRequestClose={()=> this.setState({ confirmDelete: false })}>
            <div className='body'>
              Are you sure you'd like to perminantly delete {bucket.name}?
            </div>
            <div className='actions'>
              <Button onClick={()=> this.setState({ confirmDelete: false })} flat>Cancel</Button>
              <Button
                onClick={::this.handleDelete}
                loading={deleteLoading}
                variant='danger'
                flat
              >Delete</Button>
            </div>
          </Dialog>
        : null}

        {open ?
          <BucketForm
            ref='bucketForm'
            viewer={viewer}
            bucket={bucket}
            loading={updateLoading}
          />
        : null}
      </BottomSheet>
    );
  }
}

UpdateBucketSheet = Relay.createContainer(UpdateBucketSheet, {
  initialVariables: {
    open: false,
    count: 50,
  },
  fragments: {
    viewer: (variables)=> Relay.QL`
      fragment on Viewer {
        ${BucketForm.getFragment('viewer').if(variables.open)}
        ${UpdateBucketMutation.getFragment('viewer').if(variables.open)}
        ${DeleteBucketMutation.getFragment('viewer').if(variables.open)}
      }
    `,
    bucket: (variables)=> Relay.QL`
      fragment on BucketNode {
        ${BucketForm.getFragment('bucket').if(variables.open)}
        ${UpdateBucketMutation.getFragment('bucket').if(variables.open)}
        ${DeleteBucketMutation.getFragment('bucket').if(variables.open)}

        name
        type
      }
    `,
  },
});

export default UpdateBucketSheet;
