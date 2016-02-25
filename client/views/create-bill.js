
import Relay from 'react-relay';
import { Component } from 'react';
import { browserHistory } from 'react-router';

import Button from 'components/button';
import BucketForm from 'components/bucket-form';

import { CreateBucketMutation } from 'mutations/buckets';

import styles from 'sass/views/create-bucket.scss';


class CreateBill extends Component {
  handleSubmit({ filters, name }) {
    const { viewer } = this.props;

    Relay.Store.commitUpdate(new CreateBucketMutation({ viewer, name, filters, type: 'bill' }), {
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
      <div className={`container ${styles.root}`}>
        <div className='heading'>
          <Button onClick={()=> browserHistory.push('/app/dashboard')} className='back'>
            <i className='fa fa-long-arrow-left'/>
          </Button>

          <h1>New Bill</h1>
        </div>

        <BucketForm
          onSubmit={::this.handleSubmit}
          viewer={viewer}
          bucket={null}
        />
      </div>
    );
  }
}

CreateBill = Relay.createContainer(CreateBill, {
  initialVariables: {
    filters: [],
    count: 50,
  },
  fragments: {
    viewer: ()=> Relay.QL`
      fragment on Viewer {
        ${CreateBucketMutation.getFragment('viewer')}
        ${BucketForm.getFragment('viewer')}
      }
    `,
  },
});

export default CreateBill;